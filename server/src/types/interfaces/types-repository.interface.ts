import { TypeEntity } from '../../domain/entities/type.entity';

export interface ITypesRepository {
  /**
   * Find all types
   * @returns Promise<TypeEntity[]> - All types in the system
   */
  findAll(): Promise<TypeEntity[]>;

  /**
   * Find type by ID with optional subtypes inclusion
   * @param id - Type ID
   * @param includeSubtypes - Whether to include subtypes
   * @returns Promise<TypeEntity | null> - Type entity or null if not found
   */
  findById(id: number, includeSubtypes?: boolean): Promise<TypeEntity | null>;

  /**
   * Count total types
   * @returns Promise<number> - Total count of types
   */
  count(): Promise<number>;
}
