const { readFileSync, writeFileSync } = require("node:fs");
const { DAY_IN_MS, KST_OFFSET_HOURS } = require("./constants.js");
// const { getToken, getPriceVolumes } = require("./ki.js");
const { getPriceVolumes } = require("./yf.js");
const { calcBase, calcGrowthRate } = require("./calc.js");

const update = async () => {
  const data = JSON.parse(readFileSync("./public/data.json", "utf8"));

  const dates = Object.keys(data).sort();
  const lastDate = new Date(dates[dates.length - 1]);
  lastDate.setUTCHours(-KST_OFFSET_HOURS);

  const dateStart = new Date(lastDate.getTime() + DAY_IN_MS); // Correct yyyy-mm-dd form but in UTC
  const now = new Date();
  const passedKst6pm = now.getUTCHours() >= 18 - KST_OFFSET_HOURS;
  const dateEnd = passedKst6pm ? now : new Date(now - DAY_IN_MS);
  if (dateStart >= dateEnd) return;

  // const access_token = await getToken();
  const access_token = undefined;
  const priceVolumes = await getPriceVolumes(dateStart, dateEnd, access_token);
  const newData = {
    ...data,
    ...priceVolumes,
  };
  calcBase(newData);
  calcGrowthRate(newData);
  writeFileSync("./public/data.json", JSON.stringify(newData, null, 2));
};

update();
