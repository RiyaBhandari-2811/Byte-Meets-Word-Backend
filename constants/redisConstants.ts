export const CACHE_KEYS = {
  TAGS: (page: number, limit: number) => `tags:page=${page}:limit=${limit}`,
  CATEGORIES: (page: number, limit: number) =>
    `categories:page=${page}:limit=${limit}`,
  ARTICLES: (page: number, limit: number) =>
    `articles:page=${page}:limit=${limit}`,
  ARTICLE_BY_ID: (id: string) => `article:${id}`,
  ARTICLES_BY_CATEGORY: (category: string, page: number, limit: number) =>
    `articles:category:${category}:page=${page}:limit=${limit}`,
  ARTICLES_BY_TAG: (tag: string, page: number, limit: number) =>
    `articles:tag:${tag}:page=${page}:limit=${limit}`,
};

export const TTL = {
  TAGS: 60 * 60 * 24 * 7, // 7 days
  CATEGORIES: 60 * 60 * 24 * 7, // 7 days
  ARTICLES: 60 * 60 * 24, // 1 day
};
