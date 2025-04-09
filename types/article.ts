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
  category: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  modifiedAt: Date;
}
