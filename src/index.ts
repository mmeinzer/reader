import ON_DEATH from "death";
import { Database } from "sqlite";
import openDb from "./db";
import { newRepo } from "./repo";
import { startServer } from "./server";

(async function main() {
  let db: Database | null;
  try {
    db = await openDb(process.env.DB_FILENAME ?? "./db");
  } catch (err) {
    console.error(err)
    db = null
  }

  if (!db) {
    console.error("error intializing db");
    process.exit(1);
  }

  const repo = newRepo(db);

  const server = startServer(repo);

  ON_DEATH(async (sig) => {
    console.log(`got signal ${sig}`);

    server.close(() => {
      console.log("HTTP server closed");
    });

    if (!db) {
      console.warn("db was null in server close function")
      process.exit(0)
    }

    await db.close();
    console.log("database closed");
    process.exit(0);
  });
})();
