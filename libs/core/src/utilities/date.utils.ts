export function getUnixTimestamp(date: Date | null = null) {
  if (date) return Math.floor(date.getTime() / 1000);
  else return Math.floor(new Date().getTime() / 1000);
}
