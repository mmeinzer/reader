import openDb from "./db";
import { startServer } from "./server";

(async function main() {
  const db = await openDb(process.env.DB_FILENAME ?? "./db");
  if (!db) {
    console.log("couldn't get db");
    process.exit(1);
  }

  startServer(db);
})();
