import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { TEST_DB, TEST_EMAIL_DOMAIN } from "./env";

// Removes the accounts this suite created (and their Working Memory records) from
// the TEST database only. Refuses to run against any other database name.
export default async function globalTeardown() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const backend = path.resolve(here, "../../backend");
  const require = createRequire(path.join(backend, "package.json"));
  const mongoose = require("mongoose");
  const line = fs.readFileSync(path.join(backend, ".env"), "utf8").split(/\r?\n/).find(l => /^\s*MONGO_URI\s*=/.test(l));
  if (!line) return;
  const uri = line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) return;
  const connection = await mongoose.createConnection(`${match[1]}/${TEST_DB}${match[3] || ""}`).asPromise();
  try {
    if (connection.db.databaseName !== TEST_DB) throw new Error(`Refusing to clean ${connection.db.databaseName}`);
    const students = connection.db.collection("students");
    const pattern = new RegExp(`@${TEST_EMAIL_DOMAIN.replace(/\./g, "\\.")}$`);
    const ids = (await students.find({ email: pattern }, { projection: { _id: 1 } }).toArray()).map(doc => doc._id);
    const collections = (await connection.db.listCollections().toArray()).map(c => c.name);
    for (const name of collections.filter(n => n !== "students")) {
      await connection.db.collection(name).deleteMany({ $or: [{ studentId: { $in: ids } }, { studentId: { $in: ids.map(String) } }] });
    }
    const { deletedCount } = await students.deleteMany({ email: pattern });
    console.log(`[teardown] removed ${deletedCount} test accounts from ${TEST_DB}`);
  } finally {
    await connection.close();
  }
}
