import { createClient } from "@supabase/supabase-js";
import { ensureWebPushConfigured, webpush } from "@/lib/push/webpush";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
};

export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureWebPushConfigured();

  const { data, error } = await supabaseAdmin
    .from("push_subscriptions")
.select("endpoint, p256dh, auth, enabled")
.eq("enabled", true);

  if (error) {
    console.error("[push] subscription query failed", error);
    throw error;
  }

  if (!data?.length) {
    console.warn("[push] no active subscriptions for user:", userId);
    return { ok: true, sent: 0, failed: 0, total: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const row of data) {
    try {
      const message = {
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/calendar",
        icon: payload.icon ?? "/icon-192.png",
        badge: payload.badge ?? "/icon-192.png",
        sentAt: Date.now(),
      };

      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        },
        JSON.stringify(message)
      );

      sent += 1;
    } catch (e: any) {
      failed += 1;

      const statusCode = e?.statusCode;
      const body = e?.body ?? e?.message ?? String(e);

      console.error("[push] send failed", {
        userId,
        endpoint: row.endpoint,
        statusCode,
        body,
      });

      if (statusCode === 404 || statusCode === 410) {
        await supabaseAdmin
          .from("push_subscriptions")
          .update({
            enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq("endpoint", row.endpoint);
      }
    }
  }

  return {
    ok: true,
    sent,
    failed,
    total: data.length,
  };
}