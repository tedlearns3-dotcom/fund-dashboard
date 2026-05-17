const fs = require("fs");
const fetch = require("node-fetch");

// -------------------------------
// FUND CONFIGURATION
// -------------------------------
const holdings = [
  // AIA (FSMOne)
  { name: "Franklin Biotechnology Discovery A (D05)", source: "fsmone", sedol: "HKFT10" },
  { name: "Templeton Eastern Europe Fund (EUR) A(acc) (D08)", source: "fsmone", sedol: "HKFT05" },
  { name: "JPM ASEAN Fund USD Acc (F08)", source: "fsmone", sedol: "HKJF01" },

  // Zurich International (Vista)
  { name: "ZI FSSA China Growth", source: "zurich" },
  { name: "ZI Allianz Oriental", source: "zurich" },
  { name: "ZI BGF World Technology", source: "zurich" },
  { name: "ZI Brock Global Healthcare", source: "zurich" }
];

// -------------------------------
// FETCH FROM FSMONE (AIA FUNDS)
// -------------------------------
async function fetchFromFSMOne(sedol) {
  const url = `https://www.fsmone.com.hk/fsmmobilev2/web-api/fund/get-factsheet?paramSedolnumber=${sedol}`;
  const res = await fetch(url);
  const json = await res.json();

  return {
    nav: json?.data?.navPrice ?? null,
    date: json?.data?.navDate ?? null,
    currency: json?.data?.currency ?? null
  };
}

// -------------------------------
// FETCH FROM ZURICH API
// -------------------------------
async function fetchFromZurich(fundName) {
  const url = "https://api.zurich.com.hk/api/v1/fund/zillfunds?producttype=Vista";
  const res = await fetch(url);
  const json = await res.json();

  const match = json?.data?.find(f => f.fundName.trim() === fundName.trim());

  return {
    nav: match?.nav ?? null,
    date: match?.navDate ?? null,
    currency: match?.currency ?? null
  };
}

// -------------------------------
// MAIN UPDATE FUNCTION
// -------------------------------
async function update() {
  const updated = [];

  for (const h of holdings) {
    let result;

    if (h.source === "fsmone") {
      result = await fetchFromFSMOne(h.sedol);
    } else if (h.source === "zurich") {
      result = await fetchFromZurich(h.name);
    }

    updated.push({
      name: h.name,
      nav: result.nav,
      navDate: result.date,
      currency: result.currency,
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

  console.log("data.json updated successfully");
}

update();
