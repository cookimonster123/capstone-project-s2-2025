export interface PaginationMeta {
   total: number;
   page: number;
   limit: number;
   totalPages: number;
   hasNext?: boolean;
   hasPrev?: boolean;
}

export interface PaginatedResponse<TItem> {
   items: TItem[];
   pagination: PaginationMeta;
}
