export function formatHours(hours: number) {
  // show integer if whole
  const isInt = Math.abs(hours - Math.round(hours)) < 1e-9;
  return isInt ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
}

export function formatLeaveDays(days: number) {
  const isInt = Math.abs(days - Math.round(days)) < 1e-9;
  return isInt ? `${Math.round(days)}일` : `${days.toFixed(1)}일`;
}
