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

const articleBySourceUrl = `SELECT id, source_url, slug, html FROM ${tableName} WHERE source_url LIKE ?`;

export function getArticleBySourceUrl(
  db: Database,
  sourceUrl: string
): Promise<Readonly<ArticlesRow | undefined>> {
  return db.get<ArticlesRow>(articleBySourceUrl, sourceUrl);
}
