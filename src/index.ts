import ON_DEATH from "death";
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

  const server = startServer(repo);

  ON_DEATH(async (sig) => {
    console.log(`got signal ${sig}`);
    server.close(() => {
      console.log("HTTP server closed");
    });
    await db.close();
    console.log("database closed");
    process.exit(0);
  });
})();
