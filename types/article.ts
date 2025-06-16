import { ICategory } from "./categories";
import { ITag } from "./tag";

export interface IArticle {
  _id: string;
  title: string;
  description: string;
  featureImage: string;
  readTime: number;
  createdAt: Date;
}

export interface IArticleDetail {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  featureImage: string;
  mainContent: string;
  readTime: number;
  category: ICategory | null;
  tags: ITag[];
  isActive: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface IGetArticlesResponse {
  name: string;
  articles: IArticle[];
  total: number;
  page: number | string;
  totalPages: number;
}
