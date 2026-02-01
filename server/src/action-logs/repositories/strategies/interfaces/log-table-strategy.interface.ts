/**
 * Strategy interface for handling log table operations
 * Each implementation handles a specific log type (Development, Reading, Pronunciation)
 */
export interface ILogTableStrategy {
  /**
   * Creates a new entry in the specialized log table
   * @param data - The data to insert into the log table
   * @returns Promise that resolves when the operation is complete
   */
  create(data: Record<string, unknown>): Promise<void>;

  /**
   * Returns the log type name that this strategy handles
   * Used for strategy selection by the registry
   * @returns The log type name (e.g., 'development', 'reading', 'pronunciation')
   */
  getLogTypeName(): string;
}
