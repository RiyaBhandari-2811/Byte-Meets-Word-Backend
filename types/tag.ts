export interface ITag {
  name: string;
  _id: string;
}

export interface IGetTagsResponse {
  tags: ITag[];
  total: number;
  page: number | string;
  totalPages: number;
}
