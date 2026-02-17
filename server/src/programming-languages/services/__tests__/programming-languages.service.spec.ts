import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ProgrammingLanguageEntity } from '../../../domain/entities/programming-language.entity';
import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { IProgrammingLanguagesRepository } from '../../interfaces/programming-languages-repository.interface';
import { ProgrammingLanguagesService } from '../programming-languages.service';

const mockProgrammingLanguagesRepository: jest.Mocked<IProgrammingLanguagesRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  count: jest.fn(),
};

describe('ProgrammingLanguagesService', () => {
  let service: ProgrammingLanguagesService;
  let repository: jest.Mocked<IProgrammingLanguagesRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgrammingLanguagesService,
        {
          provide: 'IProgrammingLanguagesRepository',
          useValue: mockProgrammingLanguagesRepository,
        },
      ],
    }).compile();

    service = module.get<ProgrammingLanguagesService>(ProgrammingLanguagesService);
    repository = module.get('IProgrammingLanguagesRepository');

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  describe('findAll()', () => {
    it('should return all programming languages', async () => {
      // Arrange
      const mockLanguages = [
        new ProgrammingLanguageEntity(1, 'JavaScript'),
        new ProgrammingLanguageEntity(2, 'TypeScript'),
      ];
      repository.findAll.mockResolvedValue(mockLanguages);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('name', 'JavaScript');
      expect(result[1]).toHaveProperty('id', 2);
    });

    it('should return empty array when no programming languages exist', async () => {
      // Arrange
      repository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should map domain entities to response DTOs correctly', async () => {
      // Arrange
      const mockLanguages = [new ProgrammingLanguageEntity(1, 'Python')];
      repository.findAll.mockResolvedValue(mockLanguages);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'Python',
      });
    });
  });

  describe('findOne()', () => {
    it('should return programming language when found', async () => {
      // Arrange
      const mockLanguage = new ProgrammingLanguageEntity(1, 'JavaScript');
      repository.findById.mockResolvedValue(mockLanguage);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'JavaScript');
    });

    it('should throw NotFoundError when programming language does not exist', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundError);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      repository.findById.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow('Database connection failed');
    });
  });
});
