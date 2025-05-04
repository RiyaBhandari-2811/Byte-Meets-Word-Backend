export interface ICategory {
  name: string;
  showOnHome: boolean;
  _id: string;
}

export interface IGetCategoriesResponse {
  name: string;
  categories: ICategory[];
  total: number;
  page: number | string;
  totalPages: number;
}
