// Money is added up in whole fils (1 JOD = 100) so there are no rounding surprises, then turned back into JOD.
export const toCents = (value) => Math.round(Number(value) * 100);
export const fromCents = (cents) => cents / 100;
