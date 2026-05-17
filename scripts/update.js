// scripts/update.js
const fs = require("fs");
const fetch = require("node-fetch");

// Your fund tickers (you can change these later)
const holdings = [
  { name: "Franklin Biotechnology Discovery A", ticker: "FBDIX" },
  { name: "Templeton Eastern Europe A", ticker: "TEURX" },
  { name: "JPM ASEAN Fund", ticker: "LPINX" },
  { name: "ZI FSSA China Growth", ticker: "FHKCX" },
  { name: "ZI Allianz Oriental", ticker: "AZOAX" },
  { name: "ZI BGF World Technology", ticker: "BGSAX" },
  { name: "ZI Brock Global Healthcare", ticker: "BHGAX" }
];

async function fetchPrice(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.chart.result[0].meta.regularMarketPrice;
}

async function update() {
  const updated = [];

  for (const h of holdings) {
    const price = await fetchPrice(h.ticker);
    updated.push({
      ...h,
      price,
      updatedAt: new Date().toISOString()
    });
  }

  fs.writeFileSync(
    "data.json",
    JSON.stringify(
      {
        lastUpdated: new Date().toISOString(),
        holdings: updated
      },
      null,
      2
    )
  );

  console.log("Updated data.json");
}

update();
