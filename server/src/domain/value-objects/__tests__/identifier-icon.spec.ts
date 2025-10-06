import { IdentifierIcon } from '../identifier-icon';

describe('IdentifierIcon Value Object (RED PHASE)', () => {
  const validUrls = [
    'https://example.com/icon.png',
    'http://example.com/icon.jpg',
    'https://cdn.example.com/icons/user.svg',
    'https://storage.example.com/images/product.webp',
    'http://localhost:3000/icon.png',
    'https://api.example.com/v1/icons/category.png',
    'https://example.com/path/to/icon.gif',
    'http://192.168.1.1/icon.png',
    'https://example.com:8080/icon.png',
    'https://sub.domain.example.com/icon.png',
  ];

  const validUrlsWithQueryAndFragment = [
    'https://example.com/icon.png?size=large',
    'https://example.com/icon.png?w=100&h=100',
    'https://example.com/icon.png#section',
    'https://example.com/icon.png?version=2#top',
    'http://example.com/icon?token=abc123',
  ];

  const invalidUrls = [
    '', // Empty string
    '   ', // Only whitespace
    '\t\n ', // Only whitespace characters
    'not-a-url', // Invalid URL format
    'ftp://example.com/icon.png', // Invalid protocol
    'file:///path/to/icon.png', // Invalid protocol
    'javascript:alert(1)', // Invalid protocol
    'data:image/png;base64,abc123', // Invalid protocol
    '//example.com/icon.png', // Missing protocol
    'example.com/icon.png', // Missing protocol
    'www.example.com/icon.png', // Missing protocol
    'A'.repeat(501), // Too long (over 500 characters)
    `http://${'A'.repeat(500)}.com`, // Too long
  ];

  const validEdgeCaseUrls = [
    'http://a.co/i', // Minimum valid URL (short domain)
    `https://example.com/${'A'.repeat(450)}.png`, // Long path but valid
    'https://example.com/icon-with-dashes.png',
    'https://example.com/icon_with_underscores.png',
    'https://example.com/ICON-UPPERCASE.PNG',
    'https://example.com/icon.2024.png',
    'https://example.com/path/to/nested/deep/icon.png',
  ];

  describe('IdentifierIcon.create()', () => {
    it.each(validUrls)('should create IdentifierIcon with valid URL: "%s"', validUrl => {
      // ACT
      const identifierIcon = IdentifierIcon.create(validUrl);

      // ASSERT
      expect(identifierIcon).toBeInstanceOf(IdentifierIcon);
      expect(identifierIcon.getValue()).toBe(validUrl.trim());
    });

    it.each(validUrlsWithQueryAndFragment)(
      'should create IdentifierIcon with URL containing query/fragment: "%s"',
      validUrl => {
        // ACT
        const identifierIcon = IdentifierIcon.create(validUrl);

        // ASSERT
        expect(identifierIcon).toBeInstanceOf(IdentifierIcon);
        expect(identifierIcon.getValue()).toBe(validUrl.trim());
      }
    );

    it('should trim whitespace from valid URLs', () => {
      // ARRANGE
      const urlWithWhitespace = '  https://example.com/icon.png  ';
      const expectedUrl = 'https://example.com/icon.png';

      // ACT
      const identifierIcon = IdentifierIcon.create(urlWithWhitespace);

      // ASSERT
      expect(identifierIcon.getValue()).toBe(expectedUrl);
    });

    it.each(invalidUrls)('should throw error for invalid URL: "%s"', invalidUrl => {
      // ACT & ASSERT
      expect(() => IdentifierIcon.create(invalidUrl)).toThrow();
    });

    it('should throw specific error for empty string', () => {
      expect(() => IdentifierIcon.create('')).toThrow('Identifier icon cannot be empty');
    });

    it('should throw specific error for whitespace-only string', () => {
      expect(() => IdentifierIcon.create('   ')).toThrow('Identifier icon cannot be empty');
    });

    it('should throw specific error for too long URL', () => {
      const longUrl = `https://example.com/${'A'.repeat(500)}`;
      expect(() => IdentifierIcon.create(longUrl)).toThrow(
        'Identifier icon URL cannot exceed 500 characters'
      );
    });

    it('should throw specific error for invalid URL format', () => {
      expect(() => IdentifierIcon.create('not-a-url')).toThrow(
        'Identifier icon must be a valid URL'
      );
    });

    it('should throw specific error for invalid protocol', () => {
      const invalidProtocols = [
        'ftp://example.com/icon.png',
        'file:///path/to/icon.png',
        'javascript:alert(1)',
      ];

      invalidProtocols.forEach(url => {
        expect(() => IdentifierIcon.create(url)).toThrow(
          'Identifier icon URL must use http or https protocol'
        );
      });
    });

    it('should throw error for null input', () => {
      expect(() => IdentifierIcon.create(null as any)).toThrow('Identifier icon must be a string');
    });

    it('should throw error for undefined input', () => {
      expect(() => IdentifierIcon.create(undefined as any)).toThrow(
        'Identifier icon must be a string'
      );
    });

    it('should throw error for non-string input', () => {
      expect(() => IdentifierIcon.create(123 as any)).toThrow('Identifier icon must be a string');
      expect(() => IdentifierIcon.create({} as any)).toThrow('Identifier icon must be a string');
      expect(() => IdentifierIcon.create([] as any)).toThrow('Identifier icon must be a string');
    });

    it.each(validEdgeCaseUrls)('should handle valid edge case URL: "%s"', edgeCaseUrl => {
      // ACT & ASSERT
      expect(() => IdentifierIcon.create(edgeCaseUrl)).not.toThrow();
      const identifierIcon = IdentifierIcon.create(edgeCaseUrl);
      expect(identifierIcon.getValue()).toBe(edgeCaseUrl.trim());
    });

    it('should accept http protocol', () => {
      // ARRANGE
      const httpUrl = 'http://example.com/icon.png';

      // ACT & ASSERT
      expect(() => IdentifierIcon.create(httpUrl)).not.toThrow();
      const identifierIcon = IdentifierIcon.create(httpUrl);
      expect(identifierIcon.getValue()).toBe(httpUrl);
    });

    it('should accept https protocol', () => {
      // ARRANGE
      const httpsUrl = 'https://example.com/icon.png';

      // ACT & ASSERT
      expect(() => IdentifierIcon.create(httpsUrl)).not.toThrow();
      const identifierIcon = IdentifierIcon.create(httpsUrl);
      expect(identifierIcon.getValue()).toBe(httpsUrl);
    });

    it('should reject URLs without protocol', () => {
      const urlsWithoutProtocol = [
        'example.com/icon.png',
        'www.example.com/icon.png',
        '//example.com/icon.png',
      ];

      urlsWithoutProtocol.forEach(url => {
        expect(() => IdentifierIcon.create(url)).toThrow();
      });
    });

    it('should reject data URLs', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(() => IdentifierIcon.create(dataUrl)).toThrow(
        'Identifier icon URL must use http or https protocol'
      );
    });

    it('should accept URLs with port numbers', () => {
      const urlsWithPorts = [
        'https://example.com:8080/icon.png',
        'http://localhost:3000/icon.png',
        'https://example.com:443/icon.png',
      ];

      urlsWithPorts.forEach(url => {
        expect(() => IdentifierIcon.create(url)).not.toThrow();
        const identifierIcon = IdentifierIcon.create(url);
        expect(identifierIcon.getValue()).toBe(url);
      });
    });

    it('should accept URLs with subdomains', () => {
      const urlsWithSubdomains = [
        'https://cdn.example.com/icon.png',
        'https://api.v2.example.com/icon.png',
        'https://sub1.sub2.sub3.example.com/icon.png',
      ];

      urlsWithSubdomains.forEach(url => {
        expect(() => IdentifierIcon.create(url)).not.toThrow();
        const identifierIcon = IdentifierIcon.create(url);
        expect(identifierIcon.getValue()).toBe(url);
      });
    });

    it('should accept URLs with IP addresses', () => {
      const urlsWithIPs = [
        'http://192.168.1.1/icon.png',
        'https://10.0.0.1/icon.png',
        'http://127.0.0.1:8080/icon.png',
      ];

      urlsWithIPs.forEach(url => {
        expect(() => IdentifierIcon.create(url)).not.toThrow();
        const identifierIcon = IdentifierIcon.create(url);
        expect(identifierIcon.getValue()).toBe(url);
      });
    });
  });

  describe('IdentifierIcon equality', () => {
    it('should return true for same values', () => {
      // ARRANGE
      const icon1 = IdentifierIcon.create('https://example.com/icon.png');
      const icon2 = IdentifierIcon.create('https://example.com/icon.png');

      // ACT & ASSERT
      expect(icon1.equals(icon2)).toBe(true);
    });

    it('should return true for same values with different whitespace', () => {
      // ARRANGE
      const icon1 = IdentifierIcon.create('https://example.com/icon.png');
      const icon2 = IdentifierIcon.create('  https://example.com/icon.png  ');

      // ACT & ASSERT
      expect(icon1.equals(icon2)).toBe(true);
    });

    it('should return false for different values', () => {
      // ARRANGE
      const icon1 = IdentifierIcon.create('https://example.com/icon1.png');
      const icon2 = IdentifierIcon.create('https://example.com/icon2.png');

      // ACT & ASSERT
      expect(icon1.equals(icon2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      // ARRANGE
      const icon1 = IdentifierIcon.create('https://example.com/Icon.png');
      const icon2 = IdentifierIcon.create('https://example.com/icon.png');

      // ACT & ASSERT
      expect(icon1.equals(icon2)).toBe(false);
    });

    it('should differentiate between http and https', () => {
      // ARRANGE
      const icon1 = IdentifierIcon.create('http://example.com/icon.png');
      const icon2 = IdentifierIcon.create('https://example.com/icon.png');

      // ACT & ASSERT
      expect(icon1.equals(icon2)).toBe(false);
    });

    it('should handle query parameters in comparison', () => {
      // ARRANGE
      const icon1 = IdentifierIcon.create('https://example.com/icon.png?size=large');
      const icon2 = IdentifierIcon.create('https://example.com/icon.png?size=large');
      const icon3 = IdentifierIcon.create('https://example.com/icon.png?size=small');

      // ACT & ASSERT
      expect(icon1.equals(icon2)).toBe(true);
      expect(icon1.equals(icon3)).toBe(false);
    });

    it('should return true when comparing same instance', () => {
      // ARRANGE
      const icon = IdentifierIcon.create('https://example.com/icon.png');

      // ACT & ASSERT
      expect(icon.equals(icon)).toBe(true);
    });

    it('should handle null comparison', () => {
      // ARRANGE
      const icon = IdentifierIcon.create('https://example.com/icon.png');

      // ACT & ASSERT
      expect(icon.equals(null as any)).toBe(false);
    });

    it('should handle undefined comparison', () => {
      // ARRANGE
      const icon = IdentifierIcon.create('https://example.com/icon.png');

      // ACT & ASSERT
      expect(icon.equals(undefined as any)).toBe(false);
    });
  });

  describe('IdentifierIcon immutability', () => {
    it('should be immutable - getValue() should always return same value', () => {
      // ARRANGE
      const originalUrl = 'https://example.com/icon.png';
      const identifierIcon = IdentifierIcon.create(originalUrl);

      // ACT
      const value1 = identifierIcon.getValue();
      const value2 = identifierIcon.getValue();

      // ASSERT
      expect(value1).toBe(originalUrl);
      expect(value2).toBe(originalUrl);
      expect(value1).toBe(value2);
    });

    it('should not allow modification of returned value', () => {
      // ARRANGE
      const identifierIcon = IdentifierIcon.create('https://example.com/icon.png');

      // ACT
      const value = identifierIcon.getValue();

      // ASSERT
      // In TypeScript, strings are immutable, but let's verify the reference
      expect(typeof value).toBe('string');
      expect(value).toBe('https://example.com/icon.png');
    });

    it('should prevent external mutation attempts', () => {
      // ARRANGE
      const identifierIcon = IdentifierIcon.create('https://example.com/icon.png');
      const value1 = identifierIcon.getValue();

      // ACT
      // Attempt to modify (this would fail at compile time, but test runtime)
      const modifiedAttempt = value1.toUpperCase();

      // ASSERT
      expect(identifierIcon.getValue()).toBe('https://example.com/icon.png');
      expect(identifierIcon.getValue()).not.toBe(modifiedAttempt);
    });
  });

  describe('IdentifierIcon business rules', () => {
    it('should preserve original URL casing', () => {
      // ARRANGE
      const mixedCaseUrl = 'https://Example.COM/Icon.PNG';

      // ACT
      const identifierIcon = IdentifierIcon.create(mixedCaseUrl);

      // ASSERT
      expect(identifierIcon.getValue()).toBe(mixedCaseUrl);
    });

    it('should preserve URL structure completely', () => {
      // ARRANGE
      const complexUrl = 'https://cdn.example.com:8080/path/to/icon.png?v=2&size=large#section';

      // ACT
      const identifierIcon = IdentifierIcon.create(complexUrl);

      // ASSERT
      expect(identifierIcon.getValue()).toBe(complexUrl);
    });

    it('should preserve query parameters', () => {
      // ARRANGE
      const urlWithQuery = 'https://example.com/icon.png?w=100&h=100&format=webp';

      // ACT
      const identifierIcon = IdentifierIcon.create(urlWithQuery);

      // ASSERT
      expect(identifierIcon.getValue()).toBe(urlWithQuery);
    });

    it('should preserve URL fragments', () => {
      // ARRANGE
      const urlWithFragment = 'https://example.com/icon.png#header';

      // ACT
      const identifierIcon = IdentifierIcon.create(urlWithFragment);

      // ASSERT
      expect(identifierIcon.getValue()).toBe(urlWithFragment);
    });

    it('should preserve special characters in URL', () => {
      // ARRANGE
      const urlWithSpecialChars = 'https://example.com/icon_name-v2.0.png';

      // ACT
      const identifierIcon = IdentifierIcon.create(urlWithSpecialChars);

      // ASSERT
      expect(identifierIcon.getValue()).toBe(urlWithSpecialChars);
    });
  });

  describe('IdentifierIcon validation boundaries', () => {
    it('should accept shortest valid URL', () => {
      // ARRANGE
      const shortestUrl = 'http://a.co/i'; // Very short but valid

      // ACT & ASSERT
      expect(() => IdentifierIcon.create(shortestUrl)).not.toThrow();
      const identifierIcon = IdentifierIcon.create(shortestUrl);
      expect(identifierIcon.getValue()).toBe(shortestUrl);
    });

    it('should accept exactly 500 characters', () => {
      // ARRANGE
      const baseUrl = 'https://example.com/';
      const padding = 'A'.repeat(500 - baseUrl.length - 4); // -4 for ".png"
      const exactly500 = `${baseUrl + padding}.png`;

      // ACT & ASSERT
      expect(exactly500).toHaveLength(500);
      expect(() => IdentifierIcon.create(exactly500)).not.toThrow();
      const identifierIcon = IdentifierIcon.create(exactly500);
      expect(identifierIcon.getValue()).toBe(exactly500);
      expect(identifierIcon.getValue()).toHaveLength(500);
    });

    it('should reject exactly 501 characters', () => {
      // ARRANGE
      const baseUrl = 'https://example.com/';
      const padding = 'A'.repeat(501 - baseUrl.length - 4); // -4 for ".png"
      const exactly501 = `${baseUrl + padding}.png`;

      // ACT & ASSERT
      expect(exactly501).toHaveLength(501);
      expect(() => IdentifierIcon.create(exactly501)).toThrow(
        'Identifier icon URL cannot exceed 500 characters'
      );
    });

    it('should validate length after trimming', () => {
      // ARRANGE
      const urlWithPadding = '  https://example.com/icon.png  ';

      // ACT & ASSERT
      expect(() => IdentifierIcon.create(urlWithPadding)).not.toThrow();
      const identifierIcon = IdentifierIcon.create(urlWithPadding);
      expect(identifierIcon.getValue()).toBe('https://example.com/icon.png');
    });

    it('should accept exactly 500 characters after trimming', () => {
      // ARRANGE
      const baseUrl = 'https://example.com/';
      const padding = 'A'.repeat(500 - baseUrl.length - 4);
      const url500 = `${baseUrl + padding}.png`;
      const urlWithWhitespace = `  ${url500}  `;

      // ACT & ASSERT
      expect(() => IdentifierIcon.create(urlWithWhitespace)).not.toThrow();
      const identifierIcon = IdentifierIcon.create(urlWithWhitespace);
      expect(identifierIcon.getValue()).toHaveLength(500);
    });

    it('should reject 501 characters after trimming', () => {
      // ARRANGE
      const baseUrl = 'https://example.com/';
      const padding = 'A'.repeat(501 - baseUrl.length - 4);
      const url501 = `${baseUrl + padding}.png`;
      const urlWithWhitespace = `  ${url501}  `;

      // ACT & ASSERT
      expect(() => IdentifierIcon.create(urlWithWhitespace)).toThrow(
        'Identifier icon URL cannot exceed 500 characters'
      );
    });

    it('should reject string that becomes empty after trimming', () => {
      expect(() => IdentifierIcon.create('     ')).toThrow('Identifier icon cannot be empty');
    });
  });

  describe('IdentifierIcon toString() and valueOf()', () => {
    it('should have proper toString() behavior', () => {
      // ARRANGE
      const url = 'https://example.com/icon.png';
      const identifierIcon = IdentifierIcon.create(url);

      // ACT & ASSERT
      expect(identifierIcon.toString()).toBe(url);
      expect(String(identifierIcon)).toBe(url);
    });

    it('should have proper valueOf() behavior', () => {
      // ARRANGE
      const url = 'https://example.com/icon.png';
      const identifierIcon = IdentifierIcon.create(url);

      // ACT & ASSERT
      expect(identifierIcon.valueOf()).toBe(url);
    });

    it('should work in string concatenation', () => {
      // ARRANGE
      const url = 'https://example.com/icon.png';
      const identifierIcon = IdentifierIcon.create(url);

      // ACT
      const concatenated = `Icon URL: ${identifierIcon}`;

      // ASSERT
      expect(concatenated).toBe('Icon URL: https://example.com/icon.png');
    });

    it('should work in template literals', () => {
      // ARRANGE
      const url = 'https://example.com/icon.png';
      const identifierIcon = IdentifierIcon.create(url);

      // ACT
      const templated = `Icon URL: ${identifierIcon}`;

      // ASSERT
      expect(templated).toBe('Icon URL: https://example.com/icon.png');
    });

    it('should work with String constructor', () => {
      // ARRANGE
      const url = 'https://example.com/icon.png';
      const identifierIcon = IdentifierIcon.create(url);

      // ACT
      const stringified = String(identifierIcon);

      // ASSERT
      expect(stringified).toBe(url);
    });
  });

  describe('IdentifierIcon serialization', () => {
    it('should serialize to JSON correctly', () => {
      // ARRANGE
      const url = 'https://example.com/icon.png';
      const identifierIcon = IdentifierIcon.create(url);

      // ACT
      const serialized = JSON.stringify(identifierIcon);

      // ASSERT
      expect(serialized).toBe(JSON.stringify(url));
    });

    it('should work in object serialization', () => {
      // ARRANGE
      const url = 'https://example.com/icon.png';
      const identifierIcon = IdentifierIcon.create(url);
      const obj = { icon: identifierIcon };

      // ACT
      const serialized = JSON.stringify(obj);

      // ASSERT
      expect(serialized).toBe(JSON.stringify({ icon: url }));
    });

    it('should work in array serialization', () => {
      // ARRANGE
      const icon1 = IdentifierIcon.create('https://example.com/icon1.png');
      const icon2 = IdentifierIcon.create('https://example.com/icon2.png');
      const arr = [icon1, icon2];

      // ACT
      const serialized = JSON.stringify(arr);

      // ASSERT
      expect(serialized).toBe(
        JSON.stringify(['https://example.com/icon1.png', 'https://example.com/icon2.png'])
      );
    });

    it('should work in nested object serialization', () => {
      // ARRANGE
      const identifierIcon = IdentifierIcon.create('https://example.com/icon.png');
      const obj = {
        meta: {
          icon: identifierIcon,
          description: 'Test icon',
        },
      };

      // ACT
      const serialized = JSON.stringify(obj);

      // ASSERT
      expect(serialized).toBe(
        JSON.stringify({
          meta: {
            icon: 'https://example.com/icon.png',
            description: 'Test icon',
          },
        })
      );
    });
  });

  describe('IdentifierIcon URL protocol validation', () => {
    it('should accept HTTP protocol (lowercase)', () => {
      const url = 'http://example.com/icon.png';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should accept HTTPS protocol (lowercase)', () => {
      const url = 'https://example.com/icon.png';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should accept HTTP protocol (uppercase)', () => {
      const url = 'HTTP://example.com/icon.png';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should accept HTTPS protocol (uppercase)', () => {
      const url = 'HTTPS://example.com/icon.png';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should reject FTP protocol', () => {
      const url = 'ftp://example.com/icon.png';
      expect(() => IdentifierIcon.create(url)).toThrow(
        'Identifier icon URL must use http or https protocol'
      );
    });

    it('should reject FILE protocol', () => {
      const url = 'file:///path/to/icon.png';
      expect(() => IdentifierIcon.create(url)).toThrow(
        'Identifier icon URL must use http or https protocol'
      );
    });

    it('should reject JAVASCRIPT protocol', () => {
      const url = 'javascript:alert(1)';
      expect(() => IdentifierIcon.create(url)).toThrow(
        'Identifier icon URL must use http or https protocol'
      );
    });

    it('should reject DATA protocol', () => {
      const url = 'data:image/png;base64,abc123';
      expect(() => IdentifierIcon.create(url)).toThrow(
        'Identifier icon URL must use http or https protocol'
      );
    });

    it('should reject MAILTO protocol', () => {
      const url = 'mailto:test@example.com';
      expect(() => IdentifierIcon.create(url)).toThrow(
        'Identifier icon URL must use http or https protocol'
      );
    });

    it('should reject TEL protocol', () => {
      const url = 'tel:+1234567890';
      expect(() => IdentifierIcon.create(url)).toThrow(
        'Identifier icon URL must use http or https protocol'
      );
    });
  });

  describe('IdentifierIcon URL format validation', () => {
    it('should accept URL with path', () => {
      const url = 'https://example.com/path/to/icon.png';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should accept URL with deeply nested path', () => {
      const url = 'https://example.com/a/b/c/d/e/f/icon.png';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should accept URL with file extension', () => {
      const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
      extensions.forEach(ext => {
        const url = `https://example.com/icon${ext}`;
        expect(() => IdentifierIcon.create(url)).not.toThrow();
      });
    });

    it('should reject URL without file extension', () => {
      const url = 'https://example.com/icon';
      expect(() => IdentifierIcon.create(url)).toThrow(
        'Identifier icon URL must include a file extension'
      );
    });

    it('should accept URL with numbers in domain', () => {
      const url = 'https://cdn2.example123.com/icon.png';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should accept URL with hyphens in domain', () => {
      const url = 'https://my-cdn.example-site.com/icon.png';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should accept URL with multiple query parameters', () => {
      const url = 'https://example.com/icon.png?w=100&h=100&format=webp&quality=80';
      expect(() => IdentifierIcon.create(url)).not.toThrow();
    });

    it('should reject malformed URLs', () => {
      const malformedUrls = [
        'https:/example.com/icon.png', // Single slash
        'https:example.com/icon.png', // No slashes
        'https//example.com/icon.png', // Wrong slash position
        'ht tps://example.com/icon.png', // Space in protocol
      ];

      malformedUrls.forEach(url => {
        expect(() => IdentifierIcon.create(url)).toThrow();
      });
    });
  });
});
