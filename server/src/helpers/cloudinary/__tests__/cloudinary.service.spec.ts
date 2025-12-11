import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

import { CloudinaryService } from '../cloudinary.service';
import { CloudinaryUploadOptions } from '../types';

// Mock Cloudinary v2
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
    url: jest.fn(),
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let configService: jest.Mocked<ConfigService>;

  // Mock configuration values
  const mockConfig = {
    cloudName: 'test-cloud-name',
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
  };

  // Helper to create mock Multer file
  const createMockMulterFile = (
    overrides: Partial<Express.Multer.File> = {}
  ): Express.Multer.File => ({
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  });

  // Helper to create mock Cloudinary response
  const createMockCloudinaryResponse = (
    overrides: Partial<UploadApiResponse> = {}
  ): UploadApiResponse =>
    ({
      public_id: 'test-public-id',
      version: 1234567890,
      signature: 'test-signature',
      width: 800,
      height: 600,
      format: 'jpg',
      resource_type: 'image',
      created_at: '2024-01-01T00:00:00Z',
      tags: [],
      bytes: 1024,
      type: 'upload',
      etag: 'test-etag',
      placeholder: false,
      url: 'http://res.cloudinary.com/test/image/upload/test-public-id.jpg',
      secure_url: 'https://res.cloudinary.com/test/image/upload/test-public-id.jpg',
      folder: 'habits',
      original_filename: 'test-image',
      api_key: 'test-key',
      pages: undefined,
      ...overrides,
    }) as UploadApiResponse;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create mock ConfigService
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const configMap: Record<string, string> = {
          CLOUDINARY_CLOUD_NAME: mockConfig.cloudName,
          CLOUDINARY_API_KEY: mockConfig.apiKey,
          CLOUDINARY_API_SECRET: mockConfig.apiSecret,
        };
        return configMap[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    configService = module.get(ConfigService);

    // Mock logger methods
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor and initialization', () => {
    it('should initialize CloudinaryService with valid configuration', () => {
      expect(service).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('CLOUDINARY_CLOUD_NAME');
      expect(configService.get).toHaveBeenCalledWith('CLOUDINARY_API_KEY');
      expect(configService.get).toHaveBeenCalledWith('CLOUDINARY_API_SECRET');
    });

    it('should call initializeCloudinary during initialization', () => {
      expect(cloudinary.config).toHaveBeenCalledWith({
        cloud_name: mockConfig.cloudName,
        api_key: mockConfig.apiKey,
        api_secret: mockConfig.apiSecret,
        secure: true,
      });
    });
  });

  describe('validateConfiguration', () => {
    it('should throw error when cloudName is missing', async () => {
      const invalidConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'CLOUDINARY_CLOUD_NAME') return '';
          if (key === 'CLOUDINARY_API_KEY') return mockConfig.apiKey;
          if (key === 'CLOUDINARY_API_SECRET') return mockConfig.apiSecret;
          return null;
        }),
      };

      await expect(async () => {
        await Test.createTestingModule({
          providers: [
            CloudinaryService,
            {
              provide: ConfigService,
              useValue: invalidConfigService,
            },
          ],
        }).compile();
      }).rejects.toThrow(
        'Cloudinary configuration is incomplete. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your environment variables.'
      );
    });

    it('should throw error when apiKey is missing', async () => {
      const invalidConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'CLOUDINARY_CLOUD_NAME') return mockConfig.cloudName;
          if (key === 'CLOUDINARY_API_KEY') return '';
          if (key === 'CLOUDINARY_API_SECRET') return mockConfig.apiSecret;
          return null;
        }),
      };

      await expect(async () => {
        await Test.createTestingModule({
          providers: [
            CloudinaryService,
            {
              provide: ConfigService,
              useValue: invalidConfigService,
            },
          ],
        }).compile();
      }).rejects.toThrow(
        'Cloudinary configuration is incomplete. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your environment variables.'
      );
    });

    it('should throw error when apiSecret is missing', async () => {
      const invalidConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'CLOUDINARY_CLOUD_NAME') return mockConfig.cloudName;
          if (key === 'CLOUDINARY_API_KEY') return mockConfig.apiKey;
          if (key === 'CLOUDINARY_API_SECRET') return '';
          return null;
        }),
      };

      await expect(async () => {
        await Test.createTestingModule({
          providers: [
            CloudinaryService,
            {
              provide: ConfigService,
              useValue: invalidConfigService,
            },
          ],
        }).compile();
      }).rejects.toThrow(
        'Cloudinary configuration is incomplete. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your environment variables.'
      );
    });

    it('should not throw error when all configuration values are present', () => {
      expect(service).toBeDefined();
    });
  });

  describe('uploadImage', () => {
    it('should successfully upload an image and return UploadResult', async () => {
      const mockFile = createMockMulterFile();
      const mockCloudinaryResponse = createMockCloudinaryResponse();
      const uploadOptions: CloudinaryUploadOptions = {
        folder: 'test-folder',
        publicId: 'test-public-id',
      };

      const mockStream = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_options, callback) => {
        callback(null, mockCloudinaryResponse);
        return mockStream;
      });

      const result = await service.uploadImage(mockFile, uploadOptions);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.url).toBe(mockCloudinaryResponse.secure_url);
      expect(result.data?.publicId).toBe(mockCloudinaryResponse.public_id);
      expect(mockStream.end).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('should transform upload options from camelCase to snake_case', async () => {
      const mockFile = createMockMulterFile();
      const mockCloudinaryResponse = createMockCloudinaryResponse();
      const uploadOptions: CloudinaryUploadOptions = {
        publicId: 'test-id',
        resourceType: 'image',
      };

      const mockStream = { end: jest.fn() };
      let capturedOptions: any;

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options: any, callback: any) => {
          capturedOptions = options;
          callback(null, mockCloudinaryResponse);
          return mockStream;
        }
      );

      await service.uploadImage(mockFile, uploadOptions);

      expect(capturedOptions).toHaveProperty('public_id', 'test-id');
      expect(capturedOptions).toHaveProperty('resource_type', 'image');
      expect(capturedOptions).not.toHaveProperty('publicId');
      expect(capturedOptions).not.toHaveProperty('resourceType');
    });

    it('should handle upload error with http_code', async () => {
      const mockFile = createMockMulterFile();
      const uploadOptions: CloudinaryUploadOptions = {};
      const mockError = {
        message: 'Upload failed',
        name: 'CloudinaryError',
        http_code: 400,
      };

      const mockStream = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_options, callback) => {
        callback(mockError, null);
        return mockStream;
      });

      const result = await service.uploadImage(mockFile, uploadOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.httpCode).toBe(400);
      expect(result.error?.message).toBe('Upload failed');
    });

    it('should handle upload error without http_code', async () => {
      const mockFile = createMockMulterFile();
      const uploadOptions: CloudinaryUploadOptions = {};
      const mockError = {
        message: 'Network error',
        name: 'Error',
      };

      const mockStream = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_options, callback) => {
        callback(mockError, null);
        return mockStream;
      });

      const result = await service.uploadImage(mockFile, uploadOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.httpCode).toBeUndefined();
      expect(result.error?.message).toBe('Network error');
    });

    it('should handle error when result is null', async () => {
      const mockFile = createMockMulterFile();
      const uploadOptions: CloudinaryUploadOptions = {};

      const mockStream = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_options, callback) => {
        callback(null, null);
        return mockStream;
      });

      await expect(service.uploadImage(mockFile, uploadOptions)).rejects.toThrow(
        'Cloudinary upload failed: no result returned'
      );
    });

    it('should include default upload options', async () => {
      const mockFile = createMockMulterFile();
      const mockCloudinaryResponse = createMockCloudinaryResponse();

      const mockStream = { end: jest.fn() };
      let capturedOptions: any;

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options: any, callback: any) => {
          capturedOptions = options;
          callback(null, mockCloudinaryResponse);
          return mockStream;
        }
      );

      await service.uploadImage(mockFile, {});

      expect(capturedOptions).toHaveProperty('resource_type', 'image');
      expect(capturedOptions).toHaveProperty('quality', 'auto');
      expect(capturedOptions).toHaveProperty('fetch_format', 'auto');
    });
  });

  describe('uploadMultipleImages', () => {
    it('should successfully upload multiple images', async () => {
      const mockFiles = [
        createMockMulterFile({ originalname: 'image1.jpg' }),
        createMockMulterFile({ originalname: 'image2.jpg' }),
        createMockMulterFile({ originalname: 'image3.jpg' }),
      ];

      const mockCloudinaryResponse = createMockCloudinaryResponse();
      const mockStream = { end: jest.fn() };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_options, callback) => {
        callback(null, mockCloudinaryResponse);
        return mockStream;
      });

      const results = await service.uploadMultipleImages(mockFiles, {});

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });

    it('should append index suffix to publicId for multiple files', async () => {
      const mockFiles = [
        createMockMulterFile({ originalname: 'image1.jpg' }),
        createMockMulterFile({ originalname: 'image2.jpg' }),
      ];

      const mockCloudinaryResponse = createMockCloudinaryResponse();
      const mockStream = { end: jest.fn() };

      const capturedOptions: any[] = [];

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options: any, callback: any) => {
          capturedOptions.push(options);
          callback(null, mockCloudinaryResponse);
          return mockStream;
        }
      );

      const uploadOptions: CloudinaryUploadOptions = {
        publicId: 'base-id',
      };

      await service.uploadMultipleImages(mockFiles, uploadOptions);

      expect(capturedOptions[0]).toHaveProperty('public_id', 'base-id_0');
      expect(capturedOptions[1]).toHaveProperty('public_id', 'base-id_1');
    });
  });

  describe('deleteImage', () => {
    it('should successfully delete an image and return true', async () => {
      const publicId = 'test-public-id';
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'ok',
      });

      const result = await service.deleteImage(publicId);

      expect(result).toBe(true);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    });

    it('should return false when deletion fails with result not ok', async () => {
      const publicId = 'test-public-id';
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'not found',
      });

      const result = await service.deleteImage(publicId);

      expect(result).toBe(false);
    });

    it('should return false and log error when deletion throws error', async () => {
      const publicId = 'test-public-id';
      const error = new Error('Deletion error');
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(error);

      const result = await service.deleteImage(publicId);

      expect(result).toBe(false);
    });
  });

  describe('buildUploadOptions', () => {
    it('should include default options', () => {
      const options: CloudinaryUploadOptions = {};
      const result = service['buildUploadOptions'](options);

      expect(result).toHaveProperty('resource_type', 'image');
      expect(result).toHaveProperty('quality', 'auto');
      expect(result).toHaveProperty('fetch_format', 'auto');
    });

    it('should convert publicId to public_id', () => {
      const options: CloudinaryUploadOptions = {
        publicId: 'test-public-id',
      };
      const result = service['buildUploadOptions'](options);

      expect(result).toHaveProperty('public_id', 'test-public-id');
      expect(result).not.toHaveProperty('publicId');
    });

    it('should convert resourceType to resource_type', () => {
      const options: CloudinaryUploadOptions = {
        resourceType: 'video',
      };
      const result = service['buildUploadOptions'](options);

      expect(result).toHaveProperty('resource_type', 'video');
      expect(result).not.toHaveProperty('resourceType');
    });
  });

  describe('mapCloudinaryResponse', () => {
    it('should correctly map all Cloudinary fields', () => {
      const mockResponse = createMockCloudinaryResponse({
        public_id: 'mapped-id',
        version: 9876543210,
        width: 1920,
        height: 1080,
        format: 'png',
        tags: ['tag1', 'tag2'],
        folder: 'test-folder',
        original_filename: 'original-name',
      });

      const result = service['mapCloudinaryResponse'](mockResponse);

      expect(result.publicId).toBe('mapped-id');
      expect(result.version).toBe(9876543210);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.format).toBe('png');
      expect(result.tags).toEqual(['tag1', 'tag2']);
      expect(result.folder).toBe('test-folder');
      expect(result.originalFilename).toBe('original-name');
    });

    it('should handle missing optional fields', () => {
      const mockResponse = {
        ...createMockCloudinaryResponse(),
        tags: [] as string[],
        folder: undefined as string | undefined,
        original_filename: undefined as string | undefined,
      } as UploadApiResponse;

      const result = service['mapCloudinaryResponse'](mockResponse);

      expect(result.tags).toEqual([]);
      expect(result.placeholder).toBe(false);
      expect(result.folder).toBeUndefined();
      expect(result.originalFilename).toBeUndefined();
    });
  });

  describe('handleUploadError', () => {
    it('should handle error with http_code', () => {
      const error = {
        message: 'Bad request',
        name: 'CloudinaryError',
        http_code: 400,
      };

      const result = service['handleUploadError'](error);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Bad request');
      expect(result.error?.name).toBe('CloudinaryError');
      expect(result.error?.httpCode).toBe(400);
    });

    it('should handle error without http_code', () => {
      const error = {
        message: 'General error',
        name: 'Error',
      };

      const result = service['handleUploadError'](error);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('General error');
      expect(result.error?.name).toBe('Error');
      expect(result.error?.httpCode).toBeUndefined();
    });

    it('should use default message when error message is missing', () => {
      const error = {
        http_code: 500,
      };

      const result = service['handleUploadError'](error);

      expect(result.error?.message).toBe('Cloudinary upload failed');
    });
  });

  describe('isFormatSupported', () => {
    it('should return true for supported format jpg', () => {
      expect(service.isFormatSupported('jpg')).toBe(true);
    });

    it('should return true for supported format png', () => {
      expect(service.isFormatSupported('png')).toBe(true);
    });

    it('should return false for unsupported format', () => {
      expect(service.isFormatSupported('mp4')).toBe(false);
    });

    it('should be case-insensitive for supported formats', () => {
      expect(service.isFormatSupported('JPG')).toBe(true);
      expect(service.isFormatSupported('PNG')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(service.isFormatSupported('')).toBe(false);
    });
  });

  describe('generateTransformationUrl', () => {
    it('should generate URL with publicId only', () => {
      const publicId = 'test-image';
      (cloudinary.url as jest.Mock).mockReturnValue(
        'https://res.cloudinary.com/test/image/upload/test-image'
      );

      const result = service.generateTransformationUrl(publicId);

      expect(cloudinary.url).toHaveBeenCalledWith(publicId, {});
      expect(result).toBe('https://res.cloudinary.com/test/image/upload/test-image');
    });

    it('should generate URL with transformations', () => {
      const publicId = 'test-image';
      const transformations = { width: 500, height: 300 };
      (cloudinary.url as jest.Mock).mockReturnValue(
        'https://res.cloudinary.com/test/image/upload/w_500,h_300/test-image'
      );

      const result = service.generateTransformationUrl(publicId, transformations);

      expect(cloudinary.url).toHaveBeenCalledWith(publicId, transformations);
      expect(result).toContain('w_500');
    });
  });
});
