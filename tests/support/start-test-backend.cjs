/*
 * Starts the real LexiLand backend for the Playwright suite, isolated from real data:
 *   - same code (backend/src/server.js), same MongoDB cluster as backend/.env,
 *     but its own database: lexiland_playwright_test (never the app's database)
 *   - port 5055 (the dev backend keeps 5000)
 *   - no Gmail credentials, so password-reset mail is only logged, never sent
 * Values set here win over backend/.env because dotenv never overrides
 * variables that already exist.
 */
const path = require("path");
const fs = require("fs");

const BACKEND = path.resolve(__dirname, "../../backend");
const TEST_DB = "lexiland_playwright_test";
const TEST_PORT = process.env.LEXILAND_TEST_API_PORT || "5055";

const envFile = fs.readFileSync(path.join(BACKEND, ".env"), "utf8");
const line = envFile.split(/\r?\n/).find(l => /^\s*MONGO_URI\s*=/.test(l));
if (!line) throw new Error("MONGO_URI not found in backend/.env");
const uri = line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");

// mongodb[+srv]://credentials@hosts[/db][?options]  ->  same, with /lexiland_playwright_test
const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(\/[^?]*)?(\?.*)?$/);
if (!match) throw new Error("Unrecognised MONGO_URI format");
process.env.MONGO_URI = `${match[1]}/${TEST_DB}${match[3] || ""}`;
process.env.PORT = TEST_PORT;
process.env.APP_URL = process.env.LEXILAND_TEST_APP_URL || "http://localhost:5186";
process.env.GMAIL_USER = "";
process.env.GMAIL_APP_PASSWORD = "";
process.env.LEXILAND_TEST_DB = TEST_DB;

process.chdir(BACKEND);
console.log(`[test-backend] database=${TEST_DB} port=${TEST_PORT}`);
require(path.join(BACKEND, "src/server.js"));
