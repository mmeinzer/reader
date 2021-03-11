import { Database } from "sqlite";

const tableName = "articles";

export const createTable = `
  CREATE TABLE IF NOT EXISTS ${tableName}
  (
    id         INTEGER PRIMARY KEY,
    source_url TEXT NOT NULL UNIQUE,
    slug       TEXT NOT NULL UNIQUE,
    html       TEXT
  )
`;

type ArticlesRow = {
  id: number;
  source_url: string;
  slug: string;
  html?: string;
};

const selectArticleBySourceUrl = `SELECT id, source_url, slug, html FROM ${tableName} WHERE source_url LIKE ?`;

type ArticleInsertInput = {
  sourceUrl: string;
  slug: string;
  html: string | null;
};
type ArticleInsertResult = {
  id: number | null;
};
const insertArticle = `INSERT INTO ${tableName} (source_url, slug, html) VALUES (?, ?, ?)`;

export function newArticlesRepo(db: Database) {
  return {
    getOneBySourceUrl(
      sourceUrl: string
    ): Promise<Readonly<ArticlesRow | undefined>> {
      return db.get<ArticlesRow>(selectArticleBySourceUrl, sourceUrl);
    },

    addOne({
      sourceUrl,
      slug,
      html,
    }: ArticleInsertInput): Promise<ArticleInsertResult> {
      return db
        .run(insertArticle, sourceUrl, slug, html)
        .then((res) => ({ id: res.lastID ?? null }))
        .catch((_) => ({ id: null }));
    },
  };
}
