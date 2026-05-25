export type Record = {
  price: number;
  volume: number;
  base?: number;
};

export type Data = {
  [dateString: string]: Record;
};

export const FIRST_BASE = 85385;
export const FIRST_DATE = '2025-10-13';

export const MULTIPLIER_MAP = [
  [0, 0],
  [20, 0.5],
  [40, 1],
  [60, 1.3],
  [80, 1.7],
  [100, 2],
];

export const getLastItem = (
  data: Data,
): ({ date: string } & Record) => {
  const dates = Object.keys(data)
    .filter((dateString) => data[dateString].base !== undefined)
    .sort();
  const lastDate = dates[dates.length - 1];
  return { date: lastDate, ...data[lastDate] };
};

export const getGrowthRate = (x: number, x0: number) => ((x - x0) / x0) * 100;

export const getMultiplier = (growthRate: number) => {
  let multiplier = 0;
  for (const m of MULTIPLIER_MAP) {
    if (growthRate < m[0]) break;
    multiplier = m[1];
  }
  return multiplier;
};

export const earningFormatted = <T extends Record>(record: T , units: number) => {
  const growthRate = getGrowthRate(record.base || 0, FIRST_BASE);
  const multiplier = getMultiplier(growthRate);
  return (units * multiplier * record.price).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
