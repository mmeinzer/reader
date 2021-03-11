import express from "express";
import bodyParser from "body-parser";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { Repository } from "./repo";
import { fetch } from "./fetch";

export function startServer(repo: Repository) {
  const app = express();
  const port = process.env.PORT ?? 8000;

  app.use(bodyParser.json());

  app.get("/health", (_, res) => {
    res.send("OK");
  });

  type PostArticleResponse = {
    redirectUrl: string | null;
    error: string | null;
  };

  app.post("/article", async (req, res) => {
    let resBody: PostArticleResponse;

    if (!req.body.url) {
      resBody = { redirectUrl: null, error: "Request must include url" };
      res.status(400).send(resBody);
      return;
    }

    const { url } = req.body;
    let cleanedUrl: string;
    try {
      const urlObject = new URL(url);
      cleanedUrl = urlObject.origin + urlObject.pathname;
    } catch (e) {
      resBody = { redirectUrl: null, error: "Invalid url" };
      res.status(400).send(resBody);
      return;
    }

    const existingArticle = await repo.articles.getOneBySourceUrl(cleanedUrl);
    if (existingArticle) {
      resBody = { redirectUrl: existingArticle.slug, error: null };
      res.send(resBody);
      return;
    }

    const articleRes = await fetch(cleanedUrl);
    if (!articleRes.body || articleRes.error) {
      resBody = { redirectUrl: null, error: "Error fetching article" };
      res.status(500).send(resBody);
      return;
    }

    var doc = new JSDOM(articleRes.body);
    let reader = new Readability(doc.window.document);
    let article = reader.parse();
    if (!article) {
      resBody = { redirectUrl: null, error: "Error parsing article" };
      res.status(500).send(resBody);
      return;
    }

    const insertResult = await repo.articles.addOne({
      sourceUrl: cleanedUrl,
      slug: "jaj2fdsf3jklds",
      html: article.content,
    });

    resBody = { redirectUrl: "https://www.google.com", error: null };
    res.send(resBody);
  });

  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}
