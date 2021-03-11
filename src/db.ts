import sqlite3 from "sqlite3";

const db = new sqlite3.Database(process.env.DB_FILENAME ?? ":memory:", () => {
  console.log("sqlite running");
});

db.run(
  "CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, html TEXT, source_url TEXT NOT NULL UNIQUE)",
  (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("articles table initialized");
  }
);

export default db;
