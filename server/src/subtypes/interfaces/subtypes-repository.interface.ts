import { SubtypeEntity } from '../../domain/entities/subtype.entity';

export interface SubtypeFilterOptions {
  typeId?: number;
}

export interface ISubtypesRepository {
  /**
   * Find all subtypes with optional filtering
   * @param filters - Optional filtering criteria
   * @returns Promise<SubtypeEntity[]> - All matching subtypes
   */
  findAll(filters?: SubtypeFilterOptions): Promise<SubtypeEntity[]>;

  /**
   * Find subtype by ID
   * @param id - Subtype ID
   * @returns Promise<SubtypeEntity | null> - Subtype entity or null if not found
   */
  findById(id: number): Promise<SubtypeEntity | null>;

  /**
   * Find subtypes by type ID
   * @param typeId - Parent type ID
   * @returns Promise<SubtypeEntity[]> - All subtypes for the type
   */
  findByTypeId(typeId: number): Promise<SubtypeEntity[]>;

  /**
   * Count total subtypes
   * @param filters - Optional filtering criteria
   * @returns Promise<number> - Total count of subtypes
   */
  count(filters?: SubtypeFilterOptions): Promise<number>;
}
