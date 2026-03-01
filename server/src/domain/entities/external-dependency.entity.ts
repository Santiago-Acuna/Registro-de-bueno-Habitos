export class ExternalDependencyEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly programmingLanguageId: number | null,
    public readonly icon: string | null = null
  ) {
    this.validateId(id);
    this.validateName(name);
    this.validateProgrammingLanguageId(programmingLanguageId);
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('External Dependency ID must be a positive integer');
    }
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('External Dependency name must be a non-empty string');
    }
    if (name.length > 100) {
      throw new Error('External Dependency name must not exceed 100 characters');
    }
  }

  private validateProgrammingLanguageId(programmingLanguageId: number | null): void {
    if (
      programmingLanguageId !== null &&
      (!Number.isInteger(programmingLanguageId) || programmingLanguageId <= 0)
    ) {
      throw new Error('Programming Language ID must be a positive integer or null');
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      programmingLanguageId: this.programmingLanguageId,
      icon: this.icon,
    };
  }

  public equals(other: ExternalDependencyEntity): boolean {
    return this.id === other.id;
  }
}
