import express from "express";
import bodyParser from "body-parser";
import { Database } from "sqlite3";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { fetch } from "./fetch";

export function startServer(db: Database) {
  const app = express();
  const port = process.env.PORT ?? 8000;

  app.use(bodyParser.json());

  app.get("/health", (_, res) => {
    res.send("OK");
  });

  type PostArticleResponse = {
    redirectUrl?: string;
    error?: string;
  };

  app.post("/article", async (req, res) => {
    let resBody: PostArticleResponse;

    if (!req.body.url) {
      resBody = { error: "Request must include url" };

      res.status(400).send(resBody);
      return;
    }

    // TODO: first clean the url so we can de-dupe them

    const articleRes = await fetch(req.body.url);
    if (!articleRes.body || articleRes.error) {
      resBody = { error: "Error fetching article" };
      res.status(500).send(resBody);
      return;
    }

    var doc = new JSDOM(articleRes.body);
    let reader = new Readability(doc.window.document);
    let article = reader.parse();

    if (!article) {
      resBody = { error: "Error parsing article" };
      res.status(500).send(resBody);
      return;
    }

    db.run(
      "INSERT INTO articles (source_url, slug, html) VALUES (?, ?, ?)",
      req.body.url,
      // TODO: get better slug logic
      article.title.trim().split(" ").join("-"),
      article.content,
      (err: Error | null) => console.log(err)
    );

    resBody = { redirectUrl: "https://www.google.com" };
    res.send(resBody);
  });

  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}
