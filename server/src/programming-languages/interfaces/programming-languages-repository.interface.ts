import { ProgrammingLanguageEntity } from '../../domain/entities/programming-language.entity';

export interface IProgrammingLanguagesRepository {
  /**
   * Find all programming languages
   * @returns Promise<ProgrammingLanguageEntity[]> - All programming languages in the system
   */
  findAll(): Promise<ProgrammingLanguageEntity[]>;

  /**
   * Find programming language by ID
   * @param id - Programming Language ID
   * @returns Promise<ProgrammingLanguageEntity | null> - Programming Language entity or null if not found
   */
  findById(id: number): Promise<ProgrammingLanguageEntity | null>;

  /**
   * Count total programming languages
   * @returns Promise<number> - Total count of programming languages
   */
  count(): Promise<number>;
}
