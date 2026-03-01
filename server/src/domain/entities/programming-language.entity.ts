export class ProgrammingLanguageEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly icon: string | null = null
  ) {
    this.validateId(id);
    this.validateName(name);
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Programming Language ID must be a positive integer');
    }
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Programming Language name must be a non-empty string');
    }
    if (name.length > 50) {
      throw new Error('Programming Language name must not exceed 50 characters');
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
    };
  }

  public equals(other: ProgrammingLanguageEntity): boolean {
    return this.id === other.id;
  }
}
