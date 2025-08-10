import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse} from 'cloudinary';
import {
  CloudinaryConfig,
  CloudinaryUploadOptions,
  CloudinaryUploadResponse,
  CloudinaryError,
  UploadResult,
  FileInput,
  SupportedImageFormat,
} from './types';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly config: CloudinaryConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || '',
      apiKey: this.configService.get<string>('CLOUDINARY_API_KEY') || '',
      apiSecret: this.configService.get<string>('CLOUDINARY_API_SECRET') || '',
      secure: true,
      folder: "habits"
    };

    this.validateConfiguration();
    this.initializeCloudinary();
  }

  /**
   * Validates the Cloudinary configuration
   */
  private validateConfiguration(): void {
    const { cloudName, apiKey, apiSecret } = this.config;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary configuration is incomplete. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your environment variables.'
      );
    }
  }

  /**
   * Initializes Cloudinary with configuration
   */
  private initializeCloudinary(): void {
    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
      secure: this.config.secure ?? true,
    });

    this.logger.log('Cloudinary initialized successfully');
  }

  /**
   * Uploads an image to Cloudinary
   * @param file - File to upload (string path, Buffer, or ReadableStream)
   * @param options - Upload options
   * @returns Promise<UploadResult>
   */
  async uploadImage(
    file: FileInput,
    options: CloudinaryUploadOptions = {}
  ): Promise<UploadResult> {
    try {
      this.validateFile(file);
      
      const uploadOptions = this.buildUploadOptions(options);
      
      this.logger.log(`Uploading image to Cloudinary with options: ${JSON.stringify(uploadOptions)}`);

      const result = await cloudinary.uploader.upload(file as string, uploadOptions);
      
      const response = this.mapCloudinaryResponse(result);
      
      this.logger.log(`Image uploaded successfully. URL: ${response.secureUrl}`);

      return {
        success: true,
        data: response,
        url: response.secureUrl,
      };
    } catch (error) {
      return this.handleUploadError(error);
    }
  }

  /**
   * Uploads multiple images to Cloudinary
   * @param files - Array of files to upload
   * @param options - Upload options (applied to all files)
   * @returns Promise<UploadResult[]>
   */
  async uploadMultipleImages(
    files: FileInput[],
    options: CloudinaryUploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file, index) => {
      const fileOptions: CloudinaryUploadOptions = {
        ...options,
      };
      
      if (options.publicId) {
        fileOptions.publicId = `${options.publicId}_${index}`;
      }
      
      return this.uploadImage(file, fileOptions);
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error('Error uploading multiple images', error);
      throw error;
    }
  }

  /**
   * Deletes an image from Cloudinary
   * @param publicId - Public ID of the image to delete
   * @returns Promise<boolean>
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting image with public ID: ${publicId}`);
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        this.logger.log(`Image deleted successfully: ${publicId}`);
        return true;
      }
      
      this.logger.warn(`Failed to delete image: ${publicId}. Result: ${result.result}`);
      return false;
    } catch (error) {
      this.logger.error(`Error deleting image ${publicId}:`, error);
      return false;
    }
  }

  /**
   * Validates the input file
   */
  private validateFile(file: FileInput): void {
    if (!file) {
      throw new Error('File is required');
    }

    if (typeof file === 'string' && !file.trim()) {
      throw new Error('File path cannot be empty');
    }

    if (Buffer.isBuffer(file) && file.length === 0) {
      throw new Error('File buffer cannot be empty');
    }
  }

  /**
   * Builds upload options for Cloudinary
   */
  private buildUploadOptions(options: CloudinaryUploadOptions): Record<string, any> {
    const defaultOptions = {
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    const uploadOptions: Record<string, any> = {
      ...defaultOptions,
      ...options,
    };

    // Convert camelCase to snake_case for Cloudinary API
    if (options.publicId) {
      uploadOptions["public_id"] = options.publicId;
      delete uploadOptions["publicId"];
    }

    if (options.resourceType) {
      uploadOptions["resource_type"] = options.resourceType;
      delete uploadOptions["resourceType"];
    }

    return uploadOptions;
  }

  /**
   * Maps Cloudinary response to our response format
   */
  private mapCloudinaryResponse(result: UploadApiResponse): CloudinaryUploadResponse {
    return {
      publicId: result.public_id,
      version: result.version,
      signature: result.signature,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      createdAt: result.created_at,
      tags: result.tags || [],
      bytes: result.bytes,
      type: result.type,
      etag: result.etag,
      placeholder: result.placeholder || false,
      url: result.url,
      secureUrl: result.secure_url,
      folder: result["folder"],
      originalFilename: result.original_filename,
    };
  }

  /**
   * Handles upload errors
   */
  private handleUploadError(error: any): UploadResult {
    let cloudinaryError: CloudinaryError;

    if (error.http_code) {
      // Cloudinary API error
      cloudinaryError = {
        message: error.message || 'Cloudinary upload failed',
        name: error.name || 'CloudinaryError',
        httpCode: error.http_code,
      };
    } else {
      // General error
      cloudinaryError = {
        message: error.message || 'Unknown error occurred during upload',
        name: error.name || 'Error',
      };
    }

    this.logger.error('Cloudinary upload error:', cloudinaryError);

    return {
      success: false,
      error: cloudinaryError,
    };
  }

  /**
   * Validates if the file format is supported
   */
  isFormatSupported(format: string): boolean {
    const supportedFormats: SupportedImageFormat[] = [
      'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg'
    ];
    return supportedFormats.includes(format.toLowerCase() as SupportedImageFormat);
  }

  /**
   * Generates a transformation URL for an existing image
   */
  generateTransformationUrl(
    publicId: string, 
    transformations: Record<string, any> = {}
  ): string {
    return cloudinary.url(publicId, transformations);
  }
}