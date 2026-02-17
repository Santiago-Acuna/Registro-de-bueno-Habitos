export class SubtypeEntity {
  constructor(
    public readonly id: number,
    public readonly typeId: number,
    public readonly name: string,
    public readonly description: string
  ) {
    this.validateId(id);
    this.validateTypeId(typeId);
    this.validateName(name);
    this.validateDescription(description);
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Subtype ID must be a positive integer');
    }
  }

  private validateTypeId(typeId: number): void {
    if (!Number.isInteger(typeId) || typeId <= 0) {
      throw new Error('Type ID must be a positive integer');
    }
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Subtype name must be a non-empty string');
    }
    if (name.length > 100) {
      throw new Error('Subtype name must not exceed 100 characters');
    }
  }

  private validateDescription(description: string): void {
    if (!description || typeof description !== 'string' || description.trim() === '') {
      throw new Error('Subtype description must be a non-empty string');
    }
    if (description.length > 1000) {
      throw new Error('Subtype description must not exceed 1000 characters');
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      typeId: this.typeId,
      name: this.name,
      description: this.description,
    };
  }

  public equals(other: SubtypeEntity): boolean {
    return this.id === other.id;
  }
}
