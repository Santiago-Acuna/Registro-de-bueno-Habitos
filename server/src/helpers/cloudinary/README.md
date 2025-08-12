# Cloudinary Image Upload Utility

A comprehensive TypeScript utility for uploading images to Cloudinary in a NestJS application with proper error handling, configuration validation, and support for multiple image formats.

## Features

- ✅ Upload single or multiple images
- ✅ Support for all common image formats (JPG, PNG, WebP, GIF, etc.)
- ✅ Comprehensive error handling
- ✅ TypeScript support with full type definitions
- ✅ Environment-based configuration
- ✅ Image deletion functionality
- ✅ URL transformation support
- ✅ NestJS dependency injection ready
- ✅ Logging with NestJS Logger

## Installation

1. Install the Cloudinary dependency:
```bash
npm install cloudinary
```

2. Add environment variables to your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Quick Start

### 1. Import the CloudinaryModule

Add the CloudinaryModule to your app.module.ts or any feature module:

```typescript
import { Module } from '@nestjs/common';
import { CloudinaryModule } from './utils/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  // ...
})
export class AppModule {}
```

### 2. Inject the CloudinaryService

```typescript
import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../utils/cloudinary';

@Injectable()
export class ImageService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadProfileImage(filePath: string): Promise<string> {
    const result = await this.cloudinaryService.uploadImage(filePath, {
      folder: 'profile-images',
      quality: 'auto:best',
      format: 'webp',
    });

    if (result.success) {
      return result.url!;
    }

    throw new Error(`Upload failed: ${result.error?.message}`);
  }
}
```

## API Reference

### CloudinaryService Methods

#### `uploadImage(file: FileInput, options?: CloudinaryUploadOptions): Promise<UploadResult>`

Uploads a single image to Cloudinary.

**Parameters:**
- `file`: String path, Buffer, or ReadableStream
- `options`: Upload configuration options

**Example:**
```typescript
const result = await cloudinaryService.uploadImage('/path/to/image.jpg', {
  folder: 'habits',
  publicId: 'habit-image-123',
  quality: 'auto:best',
  format: 'webp',
  tags: ['habit', 'user-upload'],
});

if (result.success) {
  console.log('Image URL:', result.url);
  console.log('Public ID:', result.data?.publicId);
}
```

#### `uploadMultipleImages(files: FileInput[], options?: CloudinaryUploadOptions): Promise<UploadResult[]>`

Uploads multiple images simultaneously.

**Example:**
```typescript
const files = ['/path/to/image1.jpg', '/path/to/image2.png'];
const results = await cloudinaryService.uploadMultipleImages(files, {
  folder: 'gallery',
  quality: 'auto:good',
});

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Image ${index + 1} uploaded: ${result.url}`);
  }
});
```

#### `deleteImage(publicId: string): Promise<boolean>`

Deletes an image from Cloudinary.

**Example:**
```typescript
const deleted = await cloudinaryService.deleteImage('habits/habit-image-123');
console.log('Image deleted:', deleted);
```

#### `generateTransformationUrl(publicId: string, transformations: Record<string, any>): string`

Generates a transformation URL for an existing image.

**Example:**
```typescript
const thumbnailUrl = cloudinaryService.generateTransformationUrl('habits/my-image', {
  width: 150,
  height: 150,
  crop: 'fill',
  quality: 'auto',
});
```

### Configuration Options

#### CloudinaryUploadOptions

```typescript
interface CloudinaryUploadOptions {
  folder?: string;              // Cloudinary folder
  publicId?: string;            // Custom public ID
  overwrite?: boolean;          // Overwrite existing image
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  format?: SupportedImageFormat;
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number;
  transformation?: Record<string, any>;
  tags?: string[];             // Image tags
}
```

### Supported Image Formats

- JPG/JPEG
- PNG
- WebP
- GIF
- BMP
- TIFF
- SVG

### Error Handling

The service returns a structured result object:

```typescript
interface UploadResult {
  success: boolean;
  data?: CloudinaryUploadResponse;
  error?: CloudinaryError;
  url?: string;
}
```

**Example with error handling:**
```typescript
const result = await cloudinaryService.uploadImage(file);

if (result.success) {
  // Handle success
  console.log('Upload successful:', result.url);
} else {
  // Handle error
  console.error('Upload failed:', result.error?.message);
}
```

## Usage Examples

### Basic Upload
```typescript
const result = await cloudinaryService.uploadImage('/path/to/image.jpg');
```

### Upload with Options
```typescript
const result = await cloudinaryService.uploadImage(fileBuffer, {
  folder: 'user-uploads',
  publicId: 'profile-pic-123',
  format: 'webp',
  quality: 'auto:best',
  tags: ['profile', 'user'],
});
```

### Upload Multiple Images
```typescript
const files = [file1, file2, file3];
const results = await cloudinaryService.uploadMultipleImages(files, {
  folder: 'gallery',
  quality: 'auto:good',
});
```

### Delete Image
```typescript
const success = await cloudinaryService.deleteImage('user-uploads/profile-pic-123');
```

### Generate Thumbnail URL
```typescript
const thumbnailUrl = cloudinaryService.generateTransformationUrl(
  'user-uploads/profile-pic-123',
  { width: 200, height: 200, crop: 'fill' }
);
```

## Environment Variables

Required environment variables in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Best Practices

1. **Use folders** to organize images logically
2. **Set quality to 'auto'** for optimal compression
3. **Use WebP format** for better compression when supported
4. **Add tags** for easier image management
5. **Handle errors gracefully** in your application
6. **Delete unused images** to manage storage costs

## Troubleshooting

### Common Issues

1. **Configuration Error**: Ensure all environment variables are set correctly
2. **Upload Fails**: Check file path and permissions
3. **Format Not Supported**: Verify the image format is in the supported list
4. **Network Issues**: Implement retry logic for production use

### Logging

The service includes comprehensive logging. Set your log level in the environment:

```env
LOG_LEVEL=debug
```