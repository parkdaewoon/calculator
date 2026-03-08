export function calcRemindAt(
  startsAtIso: string,
  reminderMinutes: number | null
) {
  if (!startsAtIso || reminderMinutes == null) return null;

  const startsAt = new Date(startsAtIso);

  return new Date(
    startsAt.getTime() - reminderMinutes * 60 * 1000
  ).toISOString();
}