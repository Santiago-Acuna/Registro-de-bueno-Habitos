export class IdentifierIcon {
  private static readonly MAX_LENGTH = 500;

  private constructor(private readonly value: string) {}

  public static create(url: string): IdentifierIcon {
    if (typeof url !== 'string') {
      throw new Error('Identifier icon must be a string');
    }

    const trimmedUrl = url.trim();

    if (trimmedUrl.length === 0) {
      throw new Error('Identifier icon cannot be empty');
    }

    if (trimmedUrl.length > this.MAX_LENGTH) {
      throw new Error('Identifier icon URL cannot exceed 500 characters');
    }

    // Pre-validate URL format before parsing
    // Reject URLs with spaces or malformed protocol sections
    if (trimmedUrl.includes(' ')) {
      throw new Error('Identifier icon must be a valid URL');
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      throw new Error('Identifier icon must be a valid URL');
    }

    // Validate protocol
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Identifier icon URL must use http or https protocol');
    }

    // Ensure URL has proper format with double slashes after protocol (case-insensitive)
    const lowerUrl = trimmedUrl.toLowerCase();
    if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
      throw new Error('Identifier icon must be a valid URL');
    }

    // Validate file extension in pathname
    // Allow URLs with query params/fragments or with explicit file extensions
    const hasQueryOrFragment = parsedUrl.search || parsedUrl.hash;
    if (!hasQueryOrFragment && !this.hasFileExtension(parsedUrl.pathname)) {
      throw new Error('Identifier icon URL must include a file extension');
    }

    return new IdentifierIcon(trimmedUrl);
  }

  private static hasFileExtension(pathname: string): boolean {
    // Extract the last segment after the last slash
    const lastSlashIndex = pathname.lastIndexOf('/');
    const filename = pathname.substring(lastSlashIndex + 1);

    // Single or very short filenames (1-2 chars) are acceptable (e.g., /i, /a)
    if (filename.length <= 2) {
      return true;
    }

    // Check if filename contains a dot (indicating an extension)
    return filename.includes('.');
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: IdentifierIcon): boolean {
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
