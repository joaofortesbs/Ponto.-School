export interface ActivityDownloadData {
  id: string;
  type: string;
  title: string;
  description?: string;
  customFields?: any;
  content?: any;
  originalData?: any;
  [key: string]: any;
}

export type ActivityDownloadFormat = 'docx' | 'pdf' | 'png';

export interface DownloadOptions {
  format: ActivityDownloadFormat;
  fileName?: string;
  includeAnswers?: boolean;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface DownloadResult {
  success: boolean;
  message?: string;
  error?: string;
}
