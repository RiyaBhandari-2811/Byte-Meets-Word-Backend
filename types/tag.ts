export interface ITag {
  name: string;
  _id: string;
}

export interface IGetTagsResponse {
  name: string;
  tags: ITag[];
  total: number;
  page: number | string;
  totalPages: number;
}
