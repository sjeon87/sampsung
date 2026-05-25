const calcWeightedMean = (data, dateStart, dateEnd) => {
  const priceVolumes = Object.entries(data)
    .filter(
      ([dateString, _priceVolume]) =>
        new Date(dateString) > dateStart && new Date(dateString) <= dateEnd,
    )
    .map(([_dateString, priceVolume]) => priceVolume);
  const totalVolume = priceVolumes.reduce((acc, { volume }) => acc + volume, 0);
  if (totalVolume === 0) return 0;
  const weightedMean = priceVolumes.reduce(
    (acc, { price, volume }) => acc + (price * volume) / totalVolume,
    0,
  );
  return weightedMean;
};

const calcBase = (data) => {
  const dates = Object.keys(data)
    .sort()
    .filter((dateString) => dateString >= "2025-10-13");

  dates.forEach((dateString) => {
    if (data[dateString].basePrice !== undefined) return;
    const date = new Date(dateString);

    const date1weekAgo = new Date(date);
    date1weekAgo.setUTCDate(date1weekAgo.getUTCDate() - 7);
    const base1week = calcWeightedMean(data, date1weekAgo, date);

    const date1moAgo = new Date(date);
    date1moAgo.setUTCMonth(date1moAgo.getUTCMonth() - 1);
    const base1mo = calcWeightedMean(data, date1moAgo, date);

    const date2moAgo = new Date(date);
    date2moAgo.setUTCMonth(date2moAgo.getUTCMonth() - 2);
    const base2mo = calcWeightedMean(data, date2moAgo, date);

    const base = (base1week + base1mo + base2mo) / 3;
    data[dateString].base = base;
  });
};

const calcGrowthRate = (data) => {
  const baseAt20251013 = data["2025-10-13"]?.base;
  
  if (baseAt20251013 === undefined) {
    console.warn("Base price at 2025-10-13 not found");
    return;
  }

  const dates = Object.keys(data)
    .sort()
    .filter((dateString) => dateString >= "2025-10-13" && data[dateString].base !== undefined);

  dates.forEach((dateString) => {
    const currentBase = data[dateString].base;
    const growthRate = ((currentBase - baseAt20251013) / baseAt20251013) * 100;
    data[dateString].growthRate = parseFloat(growthRate.toFixed(2));
  });
};

module.exports = {
  calcBase,
  calcGrowthRate,
};

if (require.main === module) {
  const { readFileSync, writeFileSync } = require("node:fs");
  const data = JSON.parse(readFileSync("./public/data.json", "utf8"));

  calcBase(data);
  calcGrowthRate(data);
  writeFileSync("./public/data.json", JSON.stringify(data, null, 2));
}
