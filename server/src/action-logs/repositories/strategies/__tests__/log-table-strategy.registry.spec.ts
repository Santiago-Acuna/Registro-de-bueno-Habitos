import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { DevelopmentLogStrategy } from '../development-log.strategy';
import { LogTableStrategyRegistry } from '../log-table-strategy.registry';
import { PronunciationLogStrategy } from '../pronunciation-log.strategy';
import { ReadingLogStrategy } from '../reading-log.strategy';

describe('LogTableStrategyRegistry', () => {
  let registry: LogTableStrategyRegistry;
  let developmentStrategy: DevelopmentLogStrategy;
  let readingStrategy: ReadingLogStrategy;
  let pronunciationStrategy: PronunciationLogStrategy;

  const mockPrismaService = {
    developmentLogs: { create: jest.fn() },
    readingLogs: { create: jest.fn() },
    pronunciationLogs: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevelopmentLogStrategy,
        ReadingLogStrategy,
        PronunciationLogStrategy,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'LOG_TABLE_STRATEGIES',
          useFactory: (
            dev: DevelopmentLogStrategy,
            read: ReadingLogStrategy,
            pron: PronunciationLogStrategy
          ) => [dev, read, pron],
          inject: [DevelopmentLogStrategy, ReadingLogStrategy, PronunciationLogStrategy],
        },
        LogTableStrategyRegistry,
      ],
    }).compile();

    registry = module.get<LogTableStrategyRegistry>(LogTableStrategyRegistry);
    developmentStrategy = module.get<DevelopmentLogStrategy>(DevelopmentLogStrategy);
    readingStrategy = module.get<ReadingLogStrategy>(ReadingLogStrategy);
    pronunciationStrategy = module.get<PronunciationLogStrategy>(PronunciationLogStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStrategy', () => {
    it('should return DevelopmentLogStrategy for "development" log type', () => {
      const strategy = registry.getStrategy('development');
      expect(strategy).toBe(developmentStrategy);
    });

    it('should return ReadingLogStrategy for "reading" log type', () => {
      const strategy = registry.getStrategy('reading');
      expect(strategy).toBe(readingStrategy);
    });

    it('should return PronunciationLogStrategy for "pronunciation" log type', () => {
      const strategy = registry.getStrategy('pronunciation');
      expect(strategy).toBe(pronunciationStrategy);
    });

    it('should handle case-insensitive matching', () => {
      expect(registry.getStrategy('DEVELOPMENT')).toBe(developmentStrategy);
      expect(registry.getStrategy('Reading')).toBe(readingStrategy);
      expect(registry.getStrategy('PRONUNCIATION')).toBe(pronunciationStrategy);
    });

    it('should match partial log type names', () => {
      expect(registry.getStrategy('development logs')).toBe(developmentStrategy);
      expect(registry.getStrategy('reading practice')).toBe(readingStrategy);
      expect(registry.getStrategy('pronunciation exercise')).toBe(pronunciationStrategy);
    });

    it('should throw error for unsupported log type', () => {
      expect(() => registry.getStrategy('unsupported')).toThrow(
        'Unsupported log type: unsupported'
      );
    });

    it('should throw error for empty log type name', () => {
      expect(() => registry.getStrategy('')).toThrow('Unsupported log type:');
    });
  });

  describe('strategy integration', () => {
    it('should use DevelopmentLogStrategy to create development log', async () => {
      const strategy = registry.getStrategy('development');
      const testData = { actionId: 'test-id', commitName: 'test commit' };

      await strategy.create(testData);

      expect(mockPrismaService.developmentLogs.create).toHaveBeenCalledWith({
        data: testData,
      });
    });

    it('should use ReadingLogStrategy to create reading log', async () => {
      const strategy = registry.getStrategy('reading');
      const testData = { actionId: 'test-id', pageCount: 10 };

      await strategy.create(testData);

      expect(mockPrismaService.readingLogs.create).toHaveBeenCalledWith({
        data: testData,
      });
    });

    it('should use PronunciationLogStrategy to create pronunciation log', async () => {
      const strategy = registry.getStrategy('pronunciation');
      const testData = { actionId: 'test-id', wordsPracticed: 20 };

      await strategy.create(testData);

      expect(mockPrismaService.pronunciationLogs.create).toHaveBeenCalledWith({
        data: testData,
      });
    });
  });

  describe('strategy methods', () => {
    it('should return correct log type name for each strategy', () => {
      expect(developmentStrategy.getLogTypeName()).toBe('development');
      expect(readingStrategy.getLogTypeName()).toBe('reading');
      expect(pronunciationStrategy.getLogTypeName()).toBe('pronunciation');
    });
  });
});
