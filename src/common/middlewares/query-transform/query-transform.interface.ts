export interface QueryTransformOptions {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  status?: string;
  tokenAddresses?: string;
  dateRangeFilter?: Array<{
    fieldName: string;
    min: number;
    max: number;
  }>;
}

