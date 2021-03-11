import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { createTable as createArticlesTable } from "./repo/articles";

export default async function openDb(
  dbFilename: string
): Promise<Database | null> {
  return open({
    filename: dbFilename,
    driver: sqlite3.Database,
  })
    .then(async (db) => {
      await db.exec(createArticlesTable);

      return db;
    })
    .catch((err) => {
      return null;
    });
}
