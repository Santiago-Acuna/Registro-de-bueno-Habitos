import { Inject, Injectable } from '@nestjs/common';

import { ILogTableStrategy } from './interfaces/log-table-strategy.interface';

/**
 * Registry for managing and selecting log table strategies
 * Maps log type names to their corresponding strategy implementations
 */
@Injectable()
export class LogTableStrategyRegistry {
  private readonly strategies: Map<string, ILogTableStrategy>;

  constructor(
    @Inject('LOG_TABLE_STRATEGIES')
    strategies: ILogTableStrategy[]
  ) {
    this.strategies = new Map();
    for (const strategy of strategies) {
      const logTypeName = strategy.getLogTypeName().toLowerCase();
      this.strategies.set(logTypeName, strategy);
    }
  }

  /**
   * Gets the appropriate strategy for a given log type name
   * @param logTypeName - The name of the log type (case-insensitive, supports partial matches)
   * @returns The matching strategy
   * @throws Error if no strategy is found for the log type
   */
  getStrategy(logTypeName: string): ILogTableStrategy {
    const lowerCaseLogTypeName = logTypeName.toLowerCase();

    // First try exact match
    if (this.strategies.has(lowerCaseLogTypeName)) {
      return this.strategies.get(lowerCaseLogTypeName)!;
    }

    // Then try partial match (e.g., "development logs" should match "development")
    for (const [strategyName, strategy] of this.strategies.entries()) {
      if (lowerCaseLogTypeName.includes(strategyName)) {
        return strategy;
      }
    }

    throw new Error(`Unsupported log type: ${logTypeName}`);
  }
}
