export class IdentifierName {
  private static readonly MAX_LENGTH = 255;
  private static readonly MIN_LENGTH = 1;

  private constructor(private readonly value: string) {}

  public static create(name: string): IdentifierName {
    if (typeof name !== 'string') {
      throw new Error('Identifier name must be a string');
    }

    const trimmedName = name.trim();

    if (trimmedName.length < this.MIN_LENGTH) {
      throw new Error('Identifier name cannot be empty');
    }

    if (trimmedName.length > this.MAX_LENGTH) {
      throw new Error('Identifier name cannot exceed 255 characters');
    }

    // Check for Unicode characters (only allow ASCII + Spanish characters)
    if (!this.isValidCharacters(trimmedName)) {
      throw new Error('Names with Unicode characters are not allowed');
    }

    return new IdentifierName(trimmedName);
  }

  private static isValidCharacters(str: string): boolean {
    // Only allow ASCII printable characters (space to ~) + Spanish special characters
    // Spanish characters: á, é, í, ó, ú, ñ, ü, Á, É, Í, Ó, Ú, Ñ, Ü
    // Reject all other Unicode characters including non-Spanish accents
    const spanishChars = 'áéíóúñüÁÉÍÓÚÑÜ';

    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const char = str.charAt(i);

      // Allow ASCII printable + control characters (0x00-0x7F)
      if (charCode <= 0x7f) {
        continue;
      }

      // Allow only specific Spanish characters
      if (spanishChars.includes(char)) {
        continue;
      }

      // Reject any other character
      return false;
    }

    return true;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: IdentifierName): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public valueOf(): string {
    return this.value;
  }

  public toJSON(): string {
    return this.value;
  }
}
