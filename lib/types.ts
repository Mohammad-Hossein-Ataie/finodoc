export interface CodalLetter {
  _id: number;
  attachmentUrl: string;
  companyName: string;
  excelUrl: string;
  fetchedAt: string | Date;
  hasAttachment: boolean;
  hasExcel: boolean;
  hasHtml: boolean;
  hasPdf: boolean;
  hasXbrl: boolean;
  isEstimate: boolean;
  letterCode: string;
  pageNumber: number;
  pdfUrl: string;
  publishDateTimeJalali: string;
  publishDateTimeUtc?: Date | string; // To be added via migration
  sentDateTimeJalali: string;
  superVision: {
    UnderSupervision: number;
    AdditionalInfo: string;
    Reasons: any[];
  };
  symbol: string;
  tedanUrl: string;
  title: string;
  tracingNo: number;
  underSupervision: number;
  url: string;
  xbrlUrl: string;
  tags?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface FacetCounts {
  hasPdf: number;
  hasExcel: number;
  underSupervision: number;
  topLetterCodes: { _id: string; count: number }[];
}

export interface FilterParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sortBy?: 'publishDateTimeUtc' | 'fetchedAt' | 'tracingNo' | 'companyName';
  sortDir?: 'asc' | 'desc';
  hasPdf?: boolean;
  hasExcel?: boolean;
  hasAttachment?: boolean;
  hasHtml?: boolean;
  hasXbrl?: boolean;
  underSupervision?: boolean;
  isEstimate?: boolean;
  symbol?: string;
  companyName?: string;
  letterCode?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string; // comma-separated Mongo ObjectId(s)
  industryId?: string;
  letterCategoryCode?: string;
  publisherTypeCode?: string;
  letterTypeId?: string;
}

export type ContentType = 'video' | 'audio' | 'text' | 'pdf' | 'image' | 'rich-text';

export interface ContentItem {
  _id: string;
  title: string;
  category?: string;
  type: ContentType;
  url?: string;
  richContent?: string;
  description?: string;
  viewsCount?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}
