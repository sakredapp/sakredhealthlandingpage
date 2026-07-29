#!/usr/bin/env node
/**
 * Refreshes real per-state statistics from the U.S. Census ACS 5-year API and
 * writes them to client/src/data/state-stats.json. These real, cited numbers are
 * what make the state landing pages genuinely differentiated (not name-swapped
 * duplicates), which is what keeps them out of Google's scaled-content-abuse net.
 *
 * The API key is a build-time secret — read from CENSUS_API_KEY, never committed
 * and never shipped to the client (only the generated JSON ships).
 *
 * Usage:
 *   CENSUS_API_KEY=xxxx node scripts/fetch-census.mjs
 *   npm run census:refresh
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const KEY = process.env.CENSUS_API_KEY;
if (!KEY) {
  console.error("CENSUS_API_KEY is not set. Run: CENSUS_API_KEY=xxxx npm run census:refresh");
  process.exit(1);
}

const YEAR = 2023; // latest ACS 5-year vintage
const VARS = {
  B25077_001E: "medianHomeValue",
  B25088_002E: "medianOwnerCostWithMortgage", // monthly
  B19013_001E: "medianHouseholdIncome",
  B25003_001E: "occupiedUnits",
  B25003_002E: "ownerOccupiedUnits",
  B01002_001E: "medianAge",
};

// FIPS state code -> USPS abbreviation (50 states + DC)
const FIPS_TO_ABBR = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY",
};

const codes = Object.keys(VARS).join(",");
const url = `https://api.census.gov/data/${YEAR}/acs/acs5?get=NAME,${codes}&for=state:*&key=${KEY}`;

const res = await fetch(url, { headers: { accept: "application/json" } });
if (!res.ok) {
  console.error(`Census API error ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const rows = await res.json();
const header = rows[0];
const idx = (name) => header.indexOf(name);
const num = (v) => (v == null || v === "" || Number(v) < 0 ? null : Number(v));

const stats = {};
for (const row of rows.slice(1)) {
  const fips = row[idx("state")];
  const abbr = FIPS_TO_ABBR[fips];
  if (!abbr) continue;

  const occupied = num(row[idx("B25003_001E")]);
  const owner = num(row[idx("B25003_002E")]);

  stats[abbr] = {
    name: row[idx("NAME")],
    medianHomeValue: num(row[idx("B25077_001E")]),
    medianOwnerCostWithMortgage: num(row[idx("B25088_002E")]),
    medianHouseholdIncome: num(row[idx("B19013_001E")]),
    homeownershipRate:
      occupied && owner ? Math.round((owner / occupied) * 1000) / 10 : null,
    medianAge: num(row[idx("B01002_001E")]),
  };
}

const out = {
  _meta: {
    source: `U.S. Census Bureau, American Community Survey ${YEAR} 5-Year Estimates`,
    sourceUrl: "https://www.census.gov/programs-surveys/acs",
    year: YEAR,
    fetchedAt: new Date().toISOString().slice(0, 10),
    states: Object.keys(stats).length,
  },
  states: stats,
};

const dir = dirname(fileURLToPath(import.meta.url));
const outPath = join(dir, "..", "client", "src", "data", "state-stats.json");
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${Object.keys(stats).length} states -> ${outPath}`);
