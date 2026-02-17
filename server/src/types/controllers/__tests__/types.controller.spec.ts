import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { TypeResponseDto } from '../../dto/type-response.dto';
import { TypesService } from '../../services/types.service';
import { TypesController } from '../types.controller';

const mockTypesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockThrottlerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('TypesController', () => {
  let controller: TypesController;
  let typesService: jest.Mocked<TypesService>;

  const mockTypeId = 1;

  const createMockTypeResponse = (overrides: Partial<TypeResponseDto> = {}): TypeResponseDto => ({
    id: mockTypeId,
    name: 'commit_type',
    description: 'Git commit types for development logs',
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypesController],
      providers: [
        {
          provide: TypesService,
          useValue: mockTypesService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get<TypesController>(TypesController);
    typesService = module.get(TypesService);
  });

  describe('findAll()', () => {
    it('should return all types', async () => {
      // Arrange
      const mockTypes = [
        createMockTypeResponse({ id: 1, name: 'commit_type' }),
        createMockTypeResponse({ id: 2, name: 'commit_scope' }),
      ];
      typesService.findAll.mockResolvedValue(mockTypes);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(typesService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockTypes);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no types exist', async () => {
      // Arrange
      typesService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      typesService.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne()', () => {
    it('should return type when found', async () => {
      // Arrange
      const expectedResponse = createMockTypeResponse({
        subtypes: [
          { id: 1, typeId: 1, name: 'feat', description: 'A new feature' },
          { id: 2, typeId: 1, name: 'fix', description: 'A bug fix' },
        ],
      });
      typesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findOne(mockTypeId);

      // Assert
      expect(typesService.findOne).toHaveBeenCalledWith(mockTypeId);
      expect(result).toEqual(expectedResponse);
      expect(result.subtypes).toHaveLength(2);
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      typesService.findOne.mockRejectedValue(new NotFoundError('Type', String(mockTypeId)));

      // Act & Assert
      await expect(controller.findOne(mockTypeId)).rejects.toThrow(NotFoundError);
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      typesService.findOne.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findOne(mockTypeId)).rejects.toThrow('Database error');
    });
  });

  describe('controller decorators and middleware integration', () => {
    it('should be decorated with ApiTags', () => {
      const controllerMetadata = Reflect.getMetadata('swagger/apiUseTags', TypesController);
      expect(controllerMetadata).toEqual(['types']);
    });

    it('should use ThrottlerGuard', () => {
      const guards = Reflect.getMetadata('__guards__', TypesController);
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
      const expectedResponse = createMockTypeResponse();
      typesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      await controller.findOne(validId);

      // Assert
      expect(typesService.findOne).toHaveBeenCalledWith(validId);
    });
  });
});
