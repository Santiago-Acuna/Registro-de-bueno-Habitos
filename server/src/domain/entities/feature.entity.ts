export class FeatureEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly ready: boolean,
    public readonly completedAt: Date | null
  ) {
    this.validateId(id);
    this.validateName(name);
    this.validateDescription(description);
  }

  private validateId(id: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Feature ID must be a non-empty string');
    }
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Feature name must be a non-empty string');
    }
    if (name.length > 50) {
      throw new Error('Feature name must not exceed 50 characters');
    }
  }

  private validateDescription(description: string): void {
    if (!description || typeof description !== 'string' || description.trim() === '') {
      throw new Error('Feature description must be a non-empty string');
    }
    if (description.length > 1000) {
      throw new Error('Feature description must not exceed 1000 characters');
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ready: this.ready,
      completedAt: this.completedAt,
    };
  }

  public equals(other: FeatureEntity): boolean {
    return this.id === other.id;
  }
}
