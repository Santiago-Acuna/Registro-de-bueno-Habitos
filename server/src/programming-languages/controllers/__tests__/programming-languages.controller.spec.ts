import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { ProgrammingLanguageResponseDto } from '../../dto/programming-language-response.dto';
import { ProgrammingLanguagesService } from '../../services/programming-languages.service';
import { ProgrammingLanguagesController } from '../programming-languages.controller';

const mockProgrammingLanguagesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockThrottlerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ProgrammingLanguagesController', () => {
  let controller: ProgrammingLanguagesController;
  let programmingLanguagesService: jest.Mocked<ProgrammingLanguagesService>;

  const mockLanguageId = 1;

  const createMockLanguageResponse = (
    overrides: Partial<ProgrammingLanguageResponseDto> = {}
  ): ProgrammingLanguageResponseDto => ({
    id: mockLanguageId,
    name: 'JavaScript',
    icon: null,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgrammingLanguagesController],
      providers: [
        {
          provide: ProgrammingLanguagesService,
          useValue: mockProgrammingLanguagesService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get<ProgrammingLanguagesController>(ProgrammingLanguagesController);
    programmingLanguagesService = module.get(ProgrammingLanguagesService);
  });

  describe('findAll()', () => {
    it('should return all programming languages', async () => {
      // Arrange
      const mockLanguages = [
        createMockLanguageResponse({ id: 1, name: 'JavaScript' }),
        createMockLanguageResponse({ id: 2, name: 'TypeScript' }),
      ];
      programmingLanguagesService.findAll.mockResolvedValue(mockLanguages);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(programmingLanguagesService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockLanguages);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no programming languages exist', async () => {
      // Arrange
      programmingLanguagesService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      programmingLanguagesService.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne()', () => {
    it('should return programming language when found', async () => {
      // Arrange
      const expectedResponse = createMockLanguageResponse();
      programmingLanguagesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findOne(mockLanguageId);

      // Assert
      expect(programmingLanguagesService.findOne).toHaveBeenCalledWith(mockLanguageId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      programmingLanguagesService.findOne.mockRejectedValue(
        new NotFoundError('Programming Language', String(mockLanguageId))
      );

      // Act & Assert
      await expect(controller.findOne(mockLanguageId)).rejects.toThrow(NotFoundError);
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      programmingLanguagesService.findOne.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findOne(mockLanguageId)).rejects.toThrow('Database error');
    });
  });

  describe('controller decorators and middleware integration', () => {
    it('should be decorated with ApiTags', () => {
      const controllerMetadata = Reflect.getMetadata(
        'swagger/apiUseTags',
        ProgrammingLanguagesController
      );
      expect(controllerMetadata).toEqual(['programming-languages']);
    });

    it('should use ThrottlerGuard', () => {
      const guards = Reflect.getMetadata('__guards__', ProgrammingLanguagesController);
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
      const expectedResponse = createMockLanguageResponse();
      programmingLanguagesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      await controller.findOne(validId);

      // Assert
      expect(programmingLanguagesService.findOne).toHaveBeenCalledWith(validId);
    });
  });
});
