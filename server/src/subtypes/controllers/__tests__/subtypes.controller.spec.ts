import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { SubtypeQueryDto } from '../../dto/subtype-query.dto';
import { SubtypeResponseDto } from '../../dto/subtype-response.dto';
import { SubtypesService } from '../../services/subtypes.service';
import { SubtypesController } from '../subtypes.controller';

const mockSubtypesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockThrottlerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('SubtypesController', () => {
  let controller: SubtypesController;
  let subtypesService: jest.Mocked<SubtypesService>;

  const mockSubtypeId = 1;
  const mockTypeId = 1;

  const createMockSubtypeResponse = (
    overrides: Partial<SubtypeResponseDto> = {}
  ): SubtypeResponseDto => ({
    id: mockSubtypeId,
    typeId: mockTypeId,
    name: 'feat',
    description: 'A new feature',
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubtypesController],
      providers: [
        {
          provide: SubtypesService,
          useValue: mockSubtypesService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get<SubtypesController>(SubtypesController);
    subtypesService = module.get(SubtypesService);
  });

  describe('findAll()', () => {
    it('should return all subtypes without filters', async () => {
      // Arrange
      const mockSubtypes = [
        createMockSubtypeResponse({ id: 1, name: 'feat' }),
        createMockSubtypeResponse({ id: 2, name: 'fix' }),
      ];
      subtypesService.findAll.mockResolvedValue(mockSubtypes);

      // Act
      const result = await controller.findAll({});

      // Assert
      expect(subtypesService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockSubtypes);
      expect(result).toHaveLength(2);
    });

    it('should return subtypes filtered by typeId', async () => {
      // Arrange
      const queryDto: SubtypeQueryDto = { typeId: mockTypeId };
      const mockSubtypes = [createMockSubtypeResponse({ typeId: mockTypeId })];
      subtypesService.findAll.mockResolvedValue(mockSubtypes);

      // Act
      const result = await controller.findAll(queryDto);

      // Assert
      expect(subtypesService.findAll).toHaveBeenCalledWith({ typeId: mockTypeId });
      expect(result).toEqual(mockSubtypes);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no subtypes exist', async () => {
      // Arrange
      subtypesService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll({});

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      subtypesService.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll({})).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne()', () => {
    it('should return subtype when found', async () => {
      // Arrange
      const expectedResponse = createMockSubtypeResponse();
      subtypesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findOne(mockSubtypeId);

      // Assert
      expect(subtypesService.findOne).toHaveBeenCalledWith(mockSubtypeId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      subtypesService.findOne.mockRejectedValue(
        new NotFoundError('Subtype', String(mockSubtypeId))
      );

      // Act & Assert
      await expect(controller.findOne(mockSubtypeId)).rejects.toThrow(NotFoundError);
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      subtypesService.findOne.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findOne(mockSubtypeId)).rejects.toThrow('Database error');
    });
  });

  describe('controller decorators and middleware integration', () => {
    it('should be decorated with ApiTags', () => {
      const controllerMetadata = Reflect.getMetadata('swagger/apiUseTags', SubtypesController);
      expect(controllerMetadata).toEqual(['subtypes']);
    });

    it('should use ThrottlerGuard', () => {
      const guards = Reflect.getMetadata('__guards__', SubtypesController);
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
      const expectedResponse = createMockSubtypeResponse();
      subtypesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      await controller.findOne(validId);

      // Assert
      expect(subtypesService.findOne).toHaveBeenCalledWith(validId);
    });

    it('should handle typeId query parameter', async () => {
      // Arrange
      const queryDto: SubtypeQueryDto = { typeId: 2 };
      const mockSubtypes = [createMockSubtypeResponse({ typeId: 2 })];
      subtypesService.findAll.mockResolvedValue(mockSubtypes);

      // Act
      await controller.findAll(queryDto);

      // Assert
      expect(subtypesService.findAll).toHaveBeenCalledWith({ typeId: 2 });
    });
  });
});
