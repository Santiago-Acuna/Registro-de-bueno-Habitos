export class TypeEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly subtypes?: SubtypeEntity[]
  ) {
    this.validateId(id);
    this.validateName(name);
    this.validateDescription(description);
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Type ID must be a positive integer');
    }
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Type name must be a non-empty string');
    }
    if (name.length > 100) {
      throw new Error('Type name must not exceed 100 characters');
    }
  }

  private validateDescription(description: string): void {
    if (!description || typeof description !== 'string' || description.trim() === '') {
      throw new Error('Type description must be a non-empty string');
    }
    if (description.length > 1000) {
      throw new Error('Type description must not exceed 1000 characters');
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      subtypes: this.subtypes?.map(st => st.toJSON()),
    };
  }

  public equals(other: TypeEntity): boolean {
    return this.id === other.id;
  }
}

import { SubtypeEntity } from './subtype.entity';
