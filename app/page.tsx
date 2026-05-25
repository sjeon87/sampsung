"use client";

import "@picocss/pico/css/pico.min.css";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  type Data,
  earningFormatted,
  FIRST_BASE,
  FIRST_DATE,
  getGrowthRate,
  getLastItem,
  MULTIPLIER_MAP,
} from "./_util";

export default function Home() {
  const [data, setData] = useState<Data>({});

  const getData = useCallback(async () => {
    const response = await fetch("/data.json");
    const json = await response.json();
    setData(json);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const lastItem = getLastItem(data);
  const lastDate = lastItem.date || "";
  const lastBase = lastItem.base || 0;
  const lastPrice = lastItem.price;
  const lastChange = getGrowthRate(lastPrice, FIRST_BASE);

  const dataArray = Object.entries(data)
    .filter(([date, { base }]) => base !== undefined && date !== FIRST_DATE)
    .sort(([dateA, _A], [dateB, _B]) => {
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    })
    .map(([date, { base }]) => ({ date, base }));

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <hgroup>
        <h1>SamPSUng</h1>
        <p>How much can the Samsung Electronics employees earn from a PSU?</p>
      </hgroup>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <hgroup>
          <h2>
            {Math.floor(lastBase).toLocaleString()} /{" "}
            {FIRST_BASE.toLocaleString()} (
            {lastChange.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %)
          </h2>
          <p>Base price at {lastDate} / {FIRST_DATE}</p>
        </hgroup>
        <table>
          <tbody>
            <tr>
              <td>CL1/CL2</td>
              <td>{earningFormatted(lastItem, 200)}</td>
            </tr>
            <tr>
              <td>CL3/CL4</td>
              <td>{earningFormatted(lastItem, 300)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <hr />
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <Link href="https://buymeacoffee.com/lungo">Buy me a coffee ☕</Link>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <Link href="https://secunion.co.kr">동행</Link>
        <Link href="https://samsunglabor.co.kr">전삼노</Link>
        <Link href="https://selunion.co.kr">초기업</Link>
      </div>
      <hr />
      <h2>Rule</h2>
      <Link href="https://m.mk.co.kr/news/business/11441411">
        “이 정도면 내일이라도 사야되나”...전직원에 '18만전자' 강력 시그널 -
        매일경제
      </Link>
      <table>
        <thead>
          <tr>
            <th>Price</th>
            <th>Stocks</th>
          </tr>
        </thead>
        <tbody>
          {MULTIPLIER_MAP.map(([priceFactor, stockFactor]) => (
            <tr key={priceFactor}>
              <td>
                &ge; {priceFactor}% (
                {Math.ceil(
                  FIRST_BASE * (1 + priceFactor / 100),
                ).toLocaleString()}
                )
              </td>
              <td>x {stockFactor}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Formula</h2>
      <div>
        Base price is the arithmetic mean of the followings:
        <ul>
          <li>Volume weigthed mean of the last 1 week prices</li>
          <li>Volume weighted mean of the last 1 month prices</li>
          <li>Volume weighted mean of the last 2 months prices</li>
        </ul>
      </div>
      <h2>History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Price</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {dataArray.map(({ date, base }) => (
            <tr key={date}>
              <td>{date}</td>
              <td style={{ textAlign: "right" }}>
                {Math.floor(base || 0).toLocaleString()}
              </td>
              <td style={{ textAlign: "right" }}>
                {getGrowthRate(base || 0, FIRST_BASE).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 1, maximumFractionDigits: 1 },
                )}
                %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
