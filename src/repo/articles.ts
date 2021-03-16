import { Database } from "sqlite";
import Hashids from "hashids";

type Article = {
  id: number;
  slug: string;
  source_url: string;
  html?: string;
};

const tableName = "articles";

export const createTable = `
  CREATE TABLE IF NOT EXISTS ${tableName}
  (
    id         INTEGER PRIMARY KEY,
    source_url TEXT NOT NULL UNIQUE,
    html       TEXT
  )
`;

const hashids = new Hashids(
  process.env.SLUG_SALT,
  Number(process.env.SLUG_LENGTH)
);

function hashFromId(id: number): string {
  return hashids.encode(id);
}

function idFromHash(hash: string): number | undefined {
  if (!hashids.isValidId(hash)) {
    return undefined;
  }

  const maybeNumber = hashids.decode(hash)[0];
  // maybe number is always a number - exclude 0 though
  if (!maybeNumber) {
    return undefined;
  }

  return Number(maybeNumber);
}

function articleWithSlug(row: ArticleRow): Article {
  return { ...row, slug: `/${hashFromId(row.id)}` };
}

type ArticleRow = {
  id: number;
  source_url: string;
  html?: string;
};

const selectArticleById = `SELECT id, source_url, html FROM ${tableName} WHERE id = ?`;

const selectArticleBySourceUrl = `SELECT id, source_url, html FROM ${tableName} WHERE source_url LIKE ?`;

type ArticleInsertInput = {
  sourceUrl: string;
  html: string | null;
};

type ArticleInsertResult = {
  id: number | null;
  slug: string | null;
};

const insertArticle = `INSERT INTO ${tableName} (source_url, html) VALUES (?, ?)`;

export function newArticlesRepo(db: Database) {
  return {
    getOneBySourceUrl(
      sourceUrl: string
    ): Promise<Readonly<Article | undefined>> {
      return db
        .get<ArticleRow>(selectArticleBySourceUrl, sourceUrl)
        .then((row) => {
          if (!row) {
            return undefined;
          }

          return articleWithSlug(row);
        })
        .catch((err) => {
          console.error(err);
          return undefined;
        });
    },

    getOneByHash(hashId: string): Promise<Readonly<Article | undefined>> {
      const id = idFromHash(hashId);
      if (!id) {
        return Promise.resolve(undefined);
      }

      return db
        .get<ArticleRow>(selectArticleById, id)
        .then((row) => {
          if (!row) {
            return undefined;
          }

          return articleWithSlug(row);
        })
        .catch((err) => {
          console.error(err);
          return undefined;
        });
    },

    /** Adds an article and returning an id of null on failure */
    addOne({
      sourceUrl,
      html,
    }: ArticleInsertInput): Promise<ArticleInsertResult> {
      return db
        .run(insertArticle, sourceUrl, html)
        .then((res) => ({
          id: res.lastID ?? null,
          slug: res.lastID ? `/${hashFromId(res.lastID)}` : null,
        }))
        .catch((err) => {
          console.error(err);

          return { id: null, slug: null };
        });
    },
  };
}
