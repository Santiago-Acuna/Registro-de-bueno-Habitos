export class HabitName {
  private static readonly MAX_LENGTH = 50;
  private static readonly MIN_LENGTH = 1;

  private constructor(private readonly value: string) {}

  public static create(name: string): HabitName {
    if (!name || typeof name !== 'string') {
      throw new Error('Habit name must be a non-empty string');
    }

    const trimmedName = name.trim();

    if (trimmedName.length < this.MIN_LENGTH) {
      throw new Error('Habit name cannot be empty');
    }

    if (trimmedName.length > this.MAX_LENGTH) {
      throw new Error(`Habit name cannot exceed ${this.MAX_LENGTH} characters`);
    }

    return new HabitName(trimmedName);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: HabitName): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}