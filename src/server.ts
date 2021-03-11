import express from "express";
import bodyParser from "body-parser";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { Repository } from "./repo";
import { fetch } from "./fetch";

export function startServer({ articles }: Repository) {
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

    const { url } = req.body;
    let cleanedUrl: string;
    try {
      const urlObject = new URL(url);
      cleanedUrl = urlObject.origin + urlObject.pathname;
    } catch (e) {
      resBody = { error: "Invalid url" };
      res.status(400).send(resBody);
      return;
    }

    const maybeRow = await articles.getOneBySourceUrl(cleanedUrl);

    if (maybeRow) {
      resBody = { redirectUrl: maybeRow.slug };
      res.send(resBody);
      return;
    }

    const articleRes = await fetch(cleanedUrl);
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

    // await db.run(
    //   "INSERT INTO articles (source_url, slug, html) VALUES (?, ?, ?)",
    //   req.body.url,
    //   // TODO: get better slug logic
    //   article.title.trim().split(" ").join("-"),
    //   article.content
    // );

    resBody = { redirectUrl: "https://www.google.com" };
    res.send(resBody);
  });

  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}
