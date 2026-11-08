// YYYY-MM-DD in the visitor's timezone; toISOString() is UTC and is a day behind in Vietnam before 7am.
export function localDateValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
