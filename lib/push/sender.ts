import { supabaseAdmin } from "@/lib/supabase/admin";
import { ensureWebPushConfigured, webpush } from "@/lib/push/webpush";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  enabled: boolean;
};

export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureWebPushConfigured();

  const { data, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id,user_id,endpoint,p256dh,auth,enabled")
    .eq("user_id", userId)
    .eq("enabled", true);

  if (error) throw error;
  if (!data?.length) return { ok: true, sent: 0 };

  let sent = 0;

  for (const row of data as SubscriptionRow[]) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url || "/",
          icon: payload.icon || "/icon-192.png",
          badge: payload.badge || "/icon-192.png",
        })
      );

      sent += 1;
    } catch (e: any) {
      const statusCode = e?.statusCode;

      if (statusCode === 404 || statusCode === 410) {
        await supabaseAdmin
          .from("push_subscriptions")
          .update({
            enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);
      } else {
        console.error("push send failed:", row.user_id, e);
      }
    }
  }

  return { ok: true, sent };
}