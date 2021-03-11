import openDb from "./db";
import { newRepo } from "./repo";
import { startServer } from "./server";

(async function main() {
  const db = await openDb(process.env.DB_FILENAME ?? "./db");
  if (!db) {
    console.log("error intializing db");
    process.exit(1);
  }

  const repo = newRepo(db);

  startServer(repo);
})();
