/**
 * Cloudinary Configuration Types
 */
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  secure?: boolean;
  folder?:string
}

/**
 * Supported image formats for upload
 */
export type SupportedImageFormat = 
  | 'jpg' 
  | 'jpeg' 
  | 'png' 
  | 'webp' 
  | 'gif' 
  | 'bmp' 
  | 'tiff' 
  | 'svg';

/**
 * Upload options for Cloudinary
 */
export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  format?: SupportedImageFormat;
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number;
  transformation?: Record<string, any>;
  tags?: string[];
}

/**
 * Cloudinary upload response
 */
export interface CloudinaryUploadResponse {
  publicId: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  createdAt: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secureUrl: string;
  folder?: string;
  originalFilename?: string;
}

/**
 * Cloudinary error response
 */
export interface CloudinaryError {
  message: string;
  name: string;
  httpCode?: number;
}

/**
 * Upload result wrapper
 */
export interface UploadResult {
  success: boolean;
  data?: CloudinaryUploadResponse;
  error?: CloudinaryError;
  url?: string;
}

/**
 * File input types
 */
export type FileInput = string | Buffer | NodeJS.ReadableStream;