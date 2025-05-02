export const CACHE_KEYS = {
  TAGS: (page: number, limit: number) => `tags:page=${page}:limit=${limit}`,
  CATEGORIES: "cache:categories",
  ARTICLES: (page: number, limit: number) =>
    `cache:articles:page=${page}:limit=${limit}`,
  ARTICLE_BY_ID: (id: string) => `cache:article:${id}`,
  ARTICLES_BY_CATEGORY: (category: string) =>
    `cache:articles:category:${category}`,
  ARTICLES_BY_TAG: (tag: string) => `cache:articles:tag:${tag}`,
};

export const TTL = {
  TAGS: 60 * 60 * 24 * 7, // 7 days
  CATEGORIES: 60 * 60 * 24 * 7, // 7 days
  ARTICLES: 60 * 60 * 24, // 1 day
};
