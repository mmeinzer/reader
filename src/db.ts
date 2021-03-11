import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { createTable as createArticlesTable } from "./articles";

export default async function openDb(
  dbFilename: string
): Promise<Database | null> {
  return open({
    filename: dbFilename,
    driver: sqlite3.Database,
  })
    .then(async (db) => {
      console.log("sqlite running");

      // Setup tables
      await db.exec(createArticlesTable);

      console.log("table created or exists");
      return db;
    })
    .catch((err) => {
      console.error("error initializing db");
      console.error(err);
      return null;
    });
}
