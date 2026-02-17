import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SubtypeEntity } from '../../../domain/entities/subtype.entity';
import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { ISubtypesRepository } from '../../interfaces/subtypes-repository.interface';
import { SubtypesService } from '../subtypes.service';

const mockSubtypesRepository: jest.Mocked<ISubtypesRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByTypeId: jest.fn(),
  count: jest.fn(),
};

describe('SubtypesService', () => {
  let service: SubtypesService;
  let repository: jest.Mocked<ISubtypesRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtypesService,
        {
          provide: 'ISubtypesRepository',
          useValue: mockSubtypesRepository,
        },
      ],
    }).compile();

    service = module.get<SubtypesService>(SubtypesService);
    repository = module.get('ISubtypesRepository');

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  describe('findAll()', () => {
    it('should return all subtypes without filters', async () => {
      // Arrange
      const mockSubtypes = [
        new SubtypeEntity(1, 1, 'feat', 'A new feature'),
        new SubtypeEntity(2, 1, 'fix', 'A bug fix'),
      ];
      repository.findAll.mockResolvedValue(mockSubtypes);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('name', 'feat');
    });

    it('should return subtypes filtered by typeId', async () => {
      // Arrange
      const mockSubtypes = [new SubtypeEntity(1, 1, 'feat', 'A new feature')];
      repository.findAll.mockResolvedValue(mockSubtypes);

      // Act
      const result = await service.findAll({ typeId: 1 });

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith({ typeId: 1 });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('typeId', 1);
    });

    it('should return empty array when no subtypes exist', async () => {
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
      const mockSubtypes = [new SubtypeEntity(1, 1, 'test_subtype', 'Test subtype description')];
      repository.findAll.mockResolvedValue(mockSubtypes);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0]).toMatchObject({
        id: 1,
        typeId: 1,
        name: 'test_subtype',
        description: 'Test subtype description',
      });
    });
  });

  describe('findOne()', () => {
    it('should return subtype when found', async () => {
      // Arrange
      const mockSubtype = new SubtypeEntity(1, 1, 'feat', 'A new feature');
      repository.findById.mockResolvedValue(mockSubtype);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'feat');
      expect(result).toHaveProperty('typeId', 1);
    });

    it('should throw NotFoundError when subtype does not exist', async () => {
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

    it('should map entity to response DTO correctly', async () => {
      // Arrange
      const mockSubtype = new SubtypeEntity(1, 1, 'feat', 'A new feature');
      repository.findById.mockResolvedValue(mockSubtype);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        typeId: 1,
        name: 'feat',
        description: 'A new feature',
      });
    });
  });
});
