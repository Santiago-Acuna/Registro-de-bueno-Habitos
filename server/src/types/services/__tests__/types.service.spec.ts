import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SubtypeEntity } from '../../../domain/entities/subtype.entity';
import { TypeEntity } from '../../../domain/entities/type.entity';
import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { ITypesRepository } from '../../interfaces/types-repository.interface';
import { TypesService } from '../types.service';

const mockTypesRepository: jest.Mocked<ITypesRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  count: jest.fn(),
};

describe('TypesService', () => {
  let service: TypesService;
  let repository: jest.Mocked<ITypesRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypesService,
        {
          provide: 'ITypesRepository',
          useValue: mockTypesRepository,
        },
      ],
    }).compile();

    service = module.get<TypesService>(TypesService);
    repository = module.get('ITypesRepository');

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  describe('findAll()', () => {
    it('should return all types', async () => {
      // Arrange
      const mockTypes = [
        new TypeEntity(1, 'commit_type', 'Git commit types'),
        new TypeEntity(2, 'commit_scope', 'Git commit scopes'),
      ];
      repository.findAll.mockResolvedValue(mockTypes);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('name', 'commit_type');
      expect(result[1]).toHaveProperty('id', 2);
    });

    it('should return empty array when no types exist', async () => {
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
      const mockTypes = [new TypeEntity(1, 'test_type', 'Test type description')];
      repository.findAll.mockResolvedValue(mockTypes);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'test_type',
        description: 'Test type description',
      });
    });
  });

  describe('findOne()', () => {
    it('should return type with subtypes when found', async () => {
      // Arrange
      const mockSubtypes = [
        new SubtypeEntity(1, 1, 'feat', 'A new feature'),
        new SubtypeEntity(2, 1, 'fix', 'A bug fix'),
      ];
      const mockType = new TypeEntity(1, 'commit_type', 'Git commit types', mockSubtypes);
      repository.findById.mockResolvedValue(mockType);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(1, true);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'commit_type');
      expect(result.subtypes).toHaveLength(2);
      expect(result.subtypes?.[0]).toHaveProperty('name', 'feat');
    });

    it('should throw NotFoundError when type does not exist', async () => {
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

    it('should map subtypes correctly in response', async () => {
      // Arrange
      const mockSubtypes = [new SubtypeEntity(1, 1, 'feat', 'A new feature')];
      const mockType = new TypeEntity(1, 'commit_type', 'Git commit types', mockSubtypes);
      repository.findById.mockResolvedValue(mockType);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result.subtypes?.[0]).toMatchObject({
        id: 1,
        typeId: 1,
        name: 'feat',
        description: 'A new feature',
      });
    });
  });
});
