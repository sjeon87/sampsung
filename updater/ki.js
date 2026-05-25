const { readFileSync, writeFileSync } = require("node:fs");
const { env } = require("node:process");
const { DAY_IN_MS } = require("./constants.js");
require("dotenv").config();

const { APPKEY: appkey, APPSECRET: appsecret } = env;

const dateToKiString = (date) => {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
};

const kiStringToDateString = (kiDateString) => {
  const year = kiDateString.slice(0, 4);
  const month = kiDateString.slice(4, 6);
  const day = kiDateString.slice(6, 8);
  return `${year}-${month}-${day}`;
};

const getToken = async () => {
  const now = Date.now();
  {
    const { access_token, issued_at } = JSON.parse(
      readFileSync("./token.json", "utf8"),
    );
    const passed1Day = now - issued_at >= DAY_IN_MS;
    if (!passed1Day) return access_token;
  }
  const response = await fetch(
    "https://openapi.koreainvestment.com:9443/oauth2/tokenP",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey,
        appsecret,
      }),
    },
  );
  const { access_token } = await response.json();
  const result = {
    access_token,
    issued_at: now,
  };
  writeFileSync("./token.json", JSON.stringify(result, null, 2));
  return access_token;
};

const getPriceVolumes = async (dateStart, dateEnd, token) => {
  const url = new URL(
    "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
  );
  url.searchParams.append("FID_COND_MRKT_DIV_CODE", "J");
  url.searchParams.append("FID_INPUT_ISCD", "005930");
  url.searchParams.append("FID_INPUT_DATE_1", dateToKiString(dateStart));
  url.searchParams.append("FID_INPUT_DATE_2", dateToKiString(dateEnd));
  url.searchParams.append("FID_PERIOD_DIV_CODE", "D");
  url.searchParams.append("FID_ORG_ADJ_PRC", "0");
  const response = await fetch(url.href, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${token}`,
      appkey: appkey,
      appsecret: appsecret,
      tr_id: "FHKST03010100",
      custtype: "P",
    },
  });
  const json = await response.json();
  const { output2 } = json;
  const priceVolumes = Object.fromEntries(
    output2.map(({ stck_bsop_date, stck_clpr, acml_vol }) => [
      kiStringToDateString(stck_bsop_date),
      {
        price: Number(stck_clpr),
        volume: Number(acml_vol),
      },
    ]),
  );
  return priceVolumes;
};

module.exports = {
  getToken,
  getPriceVolumes,
};
