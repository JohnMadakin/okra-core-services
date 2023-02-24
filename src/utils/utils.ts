export function getDateParts(date: Date): { year: number, month: number, day: number } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return { year, month, day };
}

export function roundNumber(value: number, decimals: number): number {
  const num = value as unknown + 'e' + decimals as unknown;
  return Number(Math.round(num as number) + 'e-' + decimals);
}