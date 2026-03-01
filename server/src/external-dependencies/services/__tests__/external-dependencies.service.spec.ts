import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ExternalDependencyEntity } from '../../../domain/entities/external-dependency.entity';
import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { IExternalDependenciesRepository } from '../../interfaces/external-dependencies-repository.interface';
import { ExternalDependenciesService } from '../external-dependencies.service';

const mockExternalDependenciesRepository: jest.Mocked<IExternalDependenciesRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  count: jest.fn(),
};

describe('ExternalDependenciesService', () => {
  let service: ExternalDependenciesService;
  let repository: jest.Mocked<IExternalDependenciesRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalDependenciesService,
        {
          provide: 'IExternalDependenciesRepository',
          useValue: mockExternalDependenciesRepository,
        },
      ],
    }).compile();

    service = module.get<ExternalDependenciesService>(ExternalDependenciesService);
    repository = module.get('IExternalDependenciesRepository');

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  describe('findAll()', () => {
    it('should return all external dependencies', async () => {
      // Arrange
      const mockExternalDependencies = [
        new ExternalDependencyEntity(1, 'React', 1),
        new ExternalDependencyEntity(2, 'Express', 1),
      ];
      repository.findAll.mockResolvedValue(mockExternalDependencies);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('name', 'React');
      expect(result[1]).toHaveProperty('id', 2);
    });

    it('should return empty array when no external dependencies exist', async () => {
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
      const mockExternalDependencies = [new ExternalDependencyEntity(1, 'NestJS', 2, 'https://example.com/nestjs.png')];
      repository.findAll.mockResolvedValue(mockExternalDependencies);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'NestJS',
        programmingLanguageId: 2,
        icon: 'https://example.com/nestjs.png',
      });
    });

    it('should handle null programmingLanguageId correctly', async () => {
      // Arrange
      const mockExternalDependencies = [new ExternalDependencyEntity(1, 'Docker', null)];
      repository.findAll.mockResolvedValue(mockExternalDependencies);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'Docker',
        programmingLanguageId: null,
      });
    });
  });

  describe('findOne()', () => {
    it('should return external dependency when found', async () => {
      // Arrange
      const mockExternalDependency = new ExternalDependencyEntity(1, 'React', 1, 'https://example.com/react.png');
      repository.findById.mockResolvedValue(mockExternalDependency);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'React');
      expect(result).toHaveProperty('programmingLanguageId', 1);
      expect(result).toHaveProperty('icon', 'https://example.com/react.png');
    });

    it('should throw NotFoundError when external dependency does not exist', async () => {
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

    it('should handle null programmingLanguageId correctly', async () => {
      // Arrange
      const mockExternalDependency = new ExternalDependencyEntity(1, 'Kubernetes', null);
      repository.findById.mockResolvedValue(mockExternalDependency);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        name: 'Kubernetes',
        programmingLanguageId: null,
      });
    });
  });
});
