import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { ExternalDependencyResponseDto } from '../../dto/external-dependency-response.dto';
import { ExternalDependenciesService } from '../../services/external-dependencies.service';
import { ExternalDependenciesController } from '../external-dependencies.controller';

const mockExternalDependenciesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockThrottlerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ExternalDependenciesController', () => {
  let controller: ExternalDependenciesController;
  let externalDependenciesService: jest.Mocked<ExternalDependenciesService>;

  const mockExternalDependencyId = 1;

  const createMockExternalDependencyResponse = (
    overrides: Partial<ExternalDependencyResponseDto> = {}
  ): ExternalDependencyResponseDto => ({
    id: mockExternalDependencyId,
    name: 'React',
    programmingLanguageId: 1,
    icon: null,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalDependenciesController],
      providers: [
        {
          provide: ExternalDependenciesService,
          useValue: mockExternalDependenciesService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get<ExternalDependenciesController>(ExternalDependenciesController);
    externalDependenciesService = module.get(ExternalDependenciesService);
  });

  describe('findAll()', () => {
    it('should return all external dependencies', async () => {
      // Arrange
      const mockExternalDependencies = [
        createMockExternalDependencyResponse({ id: 1, name: 'React' }),
        createMockExternalDependencyResponse({ id: 2, name: 'Express' }),
      ];
      externalDependenciesService.findAll.mockResolvedValue(mockExternalDependencies);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(externalDependenciesService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockExternalDependencies);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no external dependencies exist', async () => {
      // Arrange
      externalDependenciesService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      externalDependenciesService.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne()', () => {
    it('should return external dependency when found', async () => {
      // Arrange
      const expectedResponse = createMockExternalDependencyResponse();
      externalDependenciesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findOne(mockExternalDependencyId);

      // Assert
      expect(externalDependenciesService.findOne).toHaveBeenCalledWith(mockExternalDependencyId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      externalDependenciesService.findOne.mockRejectedValue(
        new NotFoundError('External Dependency', String(mockExternalDependencyId))
      );

      // Act & Assert
      await expect(controller.findOne(mockExternalDependencyId)).rejects.toThrow(NotFoundError);
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      externalDependenciesService.findOne.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findOne(mockExternalDependencyId)).rejects.toThrow('Database error');
    });
  });

  describe('controller decorators and middleware integration', () => {
    it('should be decorated with ApiTags', () => {
      const controllerMetadata = Reflect.getMetadata(
        'swagger/apiUseTags',
        ExternalDependenciesController
      );
      expect(controllerMetadata).toEqual(['external-dependencies']);
    });

    it('should use ThrottlerGuard', () => {
      const guards = Reflect.getMetadata('__guards__', ExternalDependenciesController);
      expect(guards).toContain(ThrottlerGuard);
    });

    it('should have proper methods defined', () => {
      expect(controller).toBeDefined();
      expect(controller.findAll).toBeDefined();
      expect(controller.findOne).toBeDefined();
    });
  });

  describe('parameter validation', () => {
    it('should handle integer ID parameter correctly', async () => {
      // Arrange
      const validId = 1;
      const expectedResponse = createMockExternalDependencyResponse();
      externalDependenciesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      await controller.findOne(validId);

      // Assert
      expect(externalDependenciesService.findOne).toHaveBeenCalledWith(validId);
    });
  });
});
