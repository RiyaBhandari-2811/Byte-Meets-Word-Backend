import { IArticle } from './article';

export interface IRail {
  _id: string;
  name: string;
  articles: IArticle[];
  showViewAll: boolean;
}
