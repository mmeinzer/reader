import { Database } from "sqlite";
import { newArticlesRepo } from "./articles";

export function newRepo(db: Database) {
  return {
    articles: newArticlesRepo(db),
  };
}

export type Repository = ReturnType<typeof newRepo>;
