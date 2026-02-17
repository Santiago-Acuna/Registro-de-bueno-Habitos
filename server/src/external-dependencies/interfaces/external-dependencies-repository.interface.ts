import { ExternalDependencyEntity } from '../../domain/entities/external-dependency.entity';

export interface IExternalDependenciesRepository {
  /**
   * Find all external dependencies
   * @returns Promise<ExternalDependencyEntity[]> - All external dependencies in the system
   */
  findAll(): Promise<ExternalDependencyEntity[]>;

  /**
   * Find external dependency by ID
   * @param id - External Dependency ID
   * @returns Promise<ExternalDependencyEntity | null> - External Dependency entity or null if not found
   */
  findById(id: number): Promise<ExternalDependencyEntity | null>;

  /**
   * Count total external dependencies
   * @returns Promise<number> - Total count of external dependencies
   */
  count(): Promise<number>;
}
