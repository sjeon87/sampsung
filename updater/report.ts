import fs from "node:fs";
import {
  FIRST_BASE,
  FIRST_DATE,
  getLastItem,
  getGrowthRate,
  getMultiplier,
  earningFormatted,
} from "../app/_util";

const generateReport = () => {
  const data = JSON.parse(fs.readFileSync("./public/data.json", "utf8"));
  const lastItem = getLastItem(data);
  const lastDate = lastItem.date || "";
  const lastBase = lastItem.base || 0;
  const lastPrice = lastItem.price;
  const lastChange = getGrowthRate(lastPrice, FIRST_BASE);

  const growthRateForMultiplier = getGrowthRate(lastBase, FIRST_BASE);
  const multiplier = getMultiplier(growthRateForMultiplier);

  const templateContent = fs.readFileSync(
    ".github/ISSUE_TEMPLATE/daily-report.md",
    "utf8",
  );
  const parts = templateContent.split("---");
  const bodyTemplate = parts.slice(2).join("---").trim();

  const result = bodyTemplate
    .replaceAll("{lastBase}", Math.floor(lastBase).toLocaleString("en-US"))
    .replaceAll("{FIRST_BASE}", FIRST_BASE.toLocaleString("en-US"))
    .replaceAll(
      "{lastChange}",
      lastChange.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    )
    .replaceAll("{lastDate}", lastDate)
    .replaceAll("{FIRST_DATE}", FIRST_DATE)
    .replaceAll("{200 * multiplier}", (200 * multiplier).toString())
    .replaceAll("{300 * multiplier}", (300 * multiplier).toString())
    .replaceAll("{earningFormatted200}", earningFormatted(lastItem, 200))
    .replaceAll("{earningFormatted300}", earningFormatted(lastItem, 300));

  fs.writeFileSync("report-body.md", result, "utf8");
};

generateReport();
