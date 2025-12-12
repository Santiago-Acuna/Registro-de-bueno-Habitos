import { configValidation } from '../config.validation';

/**
 * Configuration Validation Tests (RED PHASE)
 *
 * This test suite validates environment variable configuration for the application.
 * Tests are written following TDD RED phase principles - they will fail until
 * proper validation implementation exists.
 *
 * User Story: As a developer, I need to ensure that all required environment
 * variables are present and valid before the application starts, so that runtime
 * errors due to misconfiguration are prevented.
 *
 * Acceptance Criteria:
 * - DATABASE_URL must be present and in valid PostgreSQL format
 * - PORT must be a number between 1-65535 with default of 3000
 * - NODE_ENV must be one of: development, staging, production, test (default: development)
 * - API_VERSION must match v[number] pattern with default v1
 * - CORS_ORIGIN can be single or comma-separated origins with default
 * - LOG_LEVEL must be valid NestJS log level with default
 * - Clear error messages for validation failures
 */
describe('Configuration Validation (RED PHASE)', () => {
  describe('DATABASE_URL validation', () => {
    describe('success cases', () => {
      it('should accept valid PostgreSQL URL with postgresql:// protocol', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.DATABASE_URL).toBe(
          'postgresql://user:password@localhost:5432/dbname',
        );
      });

      it('should accept valid PostgreSQL URL with postgres:// protocol', () => {
        const config = {
          DATABASE_URL: 'postgres://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.DATABASE_URL).toBe(
          'postgres://user:password@localhost:5432/dbname',
        );
      });

      it('should accept PostgreSQL URL with special characters in password', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:p@ssw0rd!#$@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
      });

      it('should accept PostgreSQL URL with query parameters', () => {
        const config = {
          DATABASE_URL:
            'postgresql://user:password@localhost:5432/dbname?schema=public&pool_timeout=10',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
      });

      it('should accept PostgreSQL URL with custom port', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@db.example.com:25060/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
      });

      it('should accept PostgreSQL URL with IPv4 address', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@192.168.1.100:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
      });

      it('should accept PostgreSQL URL without password', () => {
        const config = {
          DATABASE_URL: 'postgresql://user@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
      });
    });

    describe('failure cases', () => {
      it('should reject config when DATABASE_URL is missing', () => {
        const config = {
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('DATABASE_URL');
        expect(result.error?.message).toContain('required');
      });

      it('should reject config when DATABASE_URL is empty string', () => {
        const config = {
          DATABASE_URL: '',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('DATABASE_URL');
        expect(result.error?.message).toMatch(/empty|allowed to be empty/i);
      });

      it('should reject invalid protocol in DATABASE_URL', () => {
        const config = {
          DATABASE_URL: 'mysql://user:password@localhost:3306/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toMatch(/DATABASE_URL.*postgresql|postgres/i);
      });

      it('should reject DATABASE_URL without protocol', () => {
        const config = {
          DATABASE_URL: 'user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('DATABASE_URL');
      });

      it('should reject plain string as DATABASE_URL', () => {
        const config = {
          DATABASE_URL: 'localhost',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('DATABASE_URL');
      });

      it('should reject http:// protocol in DATABASE_URL', () => {
        const config = {
          DATABASE_URL: 'http://localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('DATABASE_URL');
      });

      it('should reject DATABASE_URL with only whitespace', () => {
        const config = {
          DATABASE_URL: '   ',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('DATABASE_URL');
      });
    });
  });

  describe('PORT validation', () => {
    describe('success cases', () => {
      it('should use default port 3000 when PORT is not provided', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.PORT).toBe(3000);
      });

      it('should accept valid port number 8080', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: 8080,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.PORT).toBe(8080);
      });

      it('should accept port 1 (minimum boundary)', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: 1,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.PORT).toBe(1);
      });

      it('should accept port 65535 (maximum boundary)', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: 65535,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.PORT).toBe(65535);
      });

      it('should convert string port to number', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: '4000',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.PORT).toBe(4000);
        expect(typeof result.value.PORT).toBe('number');
      });

      it('should accept common ports like 3000, 5000, 8000', () => {
        const ports = [3000, 5000, 8000];

        ports.forEach((port) => {
          const config = {
            DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
            NODE_ENV: 'development',
            PORT: port,
            CLOUDINARY_CLOUD_NAME: 'test-cloud',
            CLOUDINARY_API_KEY: 'test-key',
            CLOUDINARY_API_SECRET: 'test-secret',
          };

          const result = configValidation.validate(config);

          expect(result.error).toBeUndefined();
          expect(result.value.PORT).toBe(port);
        });
      });
    });

    describe('failure cases', () => {
      it('should reject port 0 (below minimum)', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: 0,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('PORT');
        expect(result.error?.message).toMatch(/greater than|minimum/i);
      });

      it('should reject port 65536 (above maximum)', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: 65536,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('PORT');
        expect(result.error?.message).toMatch(/less than|maximum/i);
      });

      it('should reject negative port number', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: -8080,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('PORT');
        expect(result.error?.message).toMatch(/greater than|positive/i);
      });

      it('should reject decimal port number', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: 3000.5,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('PORT');
        expect(result.error?.message).toMatch(/integer/i);
      });

      it('should reject non-numeric string as port', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: 'invalid',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('PORT');
        expect(result.error?.message).toMatch(/number/i);
      });

      it('should reject empty string as port', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: '',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('PORT');
      });

      it('should reject boolean as port', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          PORT: true,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('PORT');
      });
    });
  });

  describe('NODE_ENV validation', () => {
    describe('success cases', () => {
      it('should use default "development" when NODE_ENV is not provided', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.NODE_ENV).toBe('development');
      });

      it('should accept "development" as NODE_ENV', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.NODE_ENV).toBe('development');
      });

      it('should accept "staging" as NODE_ENV', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'staging',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.NODE_ENV).toBe('staging');
      });

      it('should accept "production" as NODE_ENV', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'production',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.NODE_ENV).toBe('production');
      });

      it('should accept "test" as NODE_ENV', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'test',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.NODE_ENV).toBe('test');
      });
    });

    describe('failure cases', () => {
      it('should reject invalid NODE_ENV value "local"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'local',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('NODE_ENV');
        expect(result.error?.message).toMatch(
          /development|staging|production|test/i,
        );
      });

      it('should reject invalid NODE_ENV value "prod"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'prod',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('NODE_ENV');
      });

      it('should reject invalid NODE_ENV value "dev"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'dev',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('NODE_ENV');
      });

      it('should reject empty string as NODE_ENV', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: '',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('NODE_ENV');
      });

      it('should reject case-sensitive invalid NODE_ENV "Production"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'Production',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('NODE_ENV');
      });

      it('should reject numeric value as NODE_ENV', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 123,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('NODE_ENV');
      });
    });
  });

  describe('API_VERSION validation', () => {
    describe('success cases', () => {
      it('should use default "v1" when API_VERSION is not provided', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.API_VERSION).toBe('v1');
      });

      it('should accept "v1" as API_VERSION', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'v1',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.API_VERSION).toBe('v1');
      });

      it('should accept "v2" as API_VERSION', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'v2',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.API_VERSION).toBe('v2');
      });

      it('should accept "v10" as API_VERSION', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'v10',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.API_VERSION).toBe('v10');
      });

      it('should accept "v999" as API_VERSION (multi-digit)', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'v999',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.API_VERSION).toBe('v999');
      });
    });

    describe('failure cases', () => {
      it('should reject API_VERSION without "v" prefix', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: '1',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('API_VERSION');
        expect(result.error?.message).toMatch(/pattern|format.*v\[number\]/i);
      });

      it('should reject API_VERSION with uppercase "V"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'V1',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('API_VERSION');
      });

      it('should reject API_VERSION with decimal "v1.5"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'v1.5',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('API_VERSION');
      });

      it('should reject API_VERSION with letters after v "vABC"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'vABC',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('API_VERSION');
      });

      it('should reject API_VERSION with just "v"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'v',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('API_VERSION');
      });

      it('should reject empty string as API_VERSION', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: '',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('API_VERSION');
      });

      it('should reject negative version "v-1"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          API_VERSION: 'v-1',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('API_VERSION');
      });
    });
  });

  describe('CORS_ORIGIN validation', () => {
    describe('success cases', () => {
      it('should use default "http://localhost:5173" when CORS_ORIGIN is not provided', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe('http://localhost:5173');
      });

      it('should accept single origin URL', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN: 'https://example.com',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe('https://example.com');
      });

      it('should accept comma-separated multiple origins', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN:
            'http://localhost:3000,http://localhost:5173,https://example.com',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe(
          'http://localhost:3000,http://localhost:5173,https://example.com',
        );
      });

      it('should accept origin with port number', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN: 'http://localhost:8080',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe('http://localhost:8080');
      });

      it('should accept origin with subdomain', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN: 'https://api.example.com',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe('https://api.example.com');
      });

      it('should accept wildcard "*" as origin', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN: '*',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe('*');
      });

      it('should accept origins with mixed protocols', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN: 'http://localhost:3000,https://example.com',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle origins with trailing slashes', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN: 'https://example.com/',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe('https://example.com/');
      });

      it('should handle origins with paths', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN: 'https://example.com/api',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe('https://example.com/api');
      });

      it('should handle origins with IPv4 addresses', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CORS_ORIGIN: 'http://192.168.1.1:3000',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.CORS_ORIGIN).toBe('http://192.168.1.1:3000');
      });
    });
  });

  describe('LOG_LEVEL validation', () => {
    describe('success cases', () => {
      it('should use default "log" when LOG_LEVEL is not provided', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.LOG_LEVEL).toBe('log');
      });

      it('should accept "error" as LOG_LEVEL', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'error',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.LOG_LEVEL).toBe('error');
      });

      it('should accept "warn" as LOG_LEVEL', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'warn',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.LOG_LEVEL).toBe('warn');
      });

      it('should accept "log" as LOG_LEVEL', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'log',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.LOG_LEVEL).toBe('log');
      });

      it('should accept "debug" as LOG_LEVEL', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'debug',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.LOG_LEVEL).toBe('debug');
      });

      it('should accept "verbose" as LOG_LEVEL', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'verbose',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.LOG_LEVEL).toBe('verbose');
      });
    });

    describe('failure cases', () => {
      it('should reject invalid LOG_LEVEL "info"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'info',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('LOG_LEVEL');
        expect(result.error?.message).toMatch(
          /error|warn|log|debug|verbose/i,
        );
      });

      it('should reject invalid LOG_LEVEL "trace"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'trace',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('LOG_LEVEL');
      });

      it('should reject invalid LOG_LEVEL "fatal"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'fatal',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('LOG_LEVEL');
      });

      it('should reject uppercase LOG_LEVEL "ERROR"', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 'ERROR',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('LOG_LEVEL');
      });

      it('should reject empty string as LOG_LEVEL', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: '',
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('LOG_LEVEL');
      });

      it('should reject numeric value as LOG_LEVEL', () => {
        const config = {
          DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
          NODE_ENV: 'development',
          LOG_LEVEL: 1,
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
        };

        const result = configValidation.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('LOG_LEVEL');
      });
    });
  });

  describe('combined validation scenarios', () => {
    it('should validate all required fields are present', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'production',
        PORT: 8080,
        API_VERSION: 'v2',
        CORS_ORIGIN: 'https://app.example.com',
        LOG_LEVEL: 'error',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.DATABASE_URL).toBe(
        'postgresql://user:password@localhost:5432/dbname',
      );
      expect(result.value.NODE_ENV).toBe('production');
      expect(result.value.PORT).toBe(8080);
      expect(result.value.API_VERSION).toBe('v2');
      expect(result.value.CORS_ORIGIN).toBe('https://app.example.com');
      expect(result.value.LOG_LEVEL).toBe('error');
    });

    it('should apply all defaults when optional fields are missing', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'development',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.PORT).toBe(3000);
      expect(result.value.API_VERSION).toBe('v1');
      expect(result.value.CORS_ORIGIN).toBe('http://localhost:5173');
      expect(result.value.LOG_LEVEL).toBe('log');
    });

    it('should report multiple validation errors at once', () => {
      const config = {
        DATABASE_URL: 'invalid-url',
        NODE_ENV: 'invalid-env',
        PORT: -1,
        API_VERSION: 'invalid',
        LOG_LEVEL: 'invalid',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config, { abortEarly: false });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('DATABASE_URL');
      expect(result.error?.message).toContain('NODE_ENV');
      expect(result.error?.message).toContain('PORT');
      expect(result.error?.message).toContain('API_VERSION');
      expect(result.error?.message).toContain('LOG_LEVEL');
    });

    it('should fail validation when DATABASE_URL is missing', () => {
      const config = {
        NODE_ENV: 'development',
        PORT: 3000,
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('DATABASE_URL');
      expect(result.error?.message).toMatch(/required/i);
    });

    it('should validate production configuration', () => {
      const config = {
        DATABASE_URL:
          'postgresql://prod_user:secure_pass@db.prod.com:5432/prod_db',
        NODE_ENV: 'production',
        PORT: 443,
        API_VERSION: 'v1',
        CORS_ORIGIN: 'https://app.production.com',
        LOG_LEVEL: 'error',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
    });

    it('should validate staging configuration', () => {
      const config = {
        DATABASE_URL:
          'postgresql://staging_user:staging_pass@db.staging.com:5432/staging_db',
        NODE_ENV: 'staging',
        PORT: 3001,
        API_VERSION: 'v2',
        CORS_ORIGIN: 'https://staging.example.com',
        LOG_LEVEL: 'debug',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
    });

    it('should validate test configuration', () => {
      const config = {
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
        NODE_ENV: 'test',
        PORT: 3002,
        API_VERSION: 'v1',
        CORS_ORIGIN: 'http://localhost:3000',
        LOG_LEVEL: 'verbose',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
    });

    it('should allow unknown environment variables when not strict', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'development',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
        UNKNOWN_VAR: 'some-value',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
    });
  });

  describe('error message clarity', () => {
    it('should provide clear error message for missing DATABASE_URL', () => {
      const config = {
        NODE_ENV: 'development',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toMatch(/DATABASE_URL.*required/i);
    });

    it('should provide clear error message for invalid PORT', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'development',
        PORT: 999999,
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('PORT');
      expect(result.error?.message).toMatch(/less than|maximum|65535/i);
    });

    it('should provide clear error message for invalid NODE_ENV', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'invalid',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('NODE_ENV');
      expect(result.error?.message).toMatch(
        /development|staging|production|test/i,
      );
    });

    it('should provide clear error message for invalid API_VERSION format', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'development',
        API_VERSION: '1',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('API_VERSION');
      expect(result.error?.message).toMatch(/pattern|format/i);
    });

    it('should provide clear error message for invalid LOG_LEVEL', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'development',
        LOG_LEVEL: 'invalid',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('LOG_LEVEL');
      expect(result.error?.message).toMatch(/error|warn|log|debug|verbose/i);
    });
  });

  describe('type conversion', () => {
    it('should convert string PORT to number', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'development',
        PORT: '8080',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.PORT).toBe(8080);
      expect(typeof result.value.PORT).toBe('number');
    });

    it('should keep string types for string fields', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
        NODE_ENV: 'development',
        API_VERSION: 'v2',
        CORS_ORIGIN: 'https://example.com',
        LOG_LEVEL: 'debug',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
      expect(typeof result.value.DATABASE_URL).toBe('string');
      expect(typeof result.value.NODE_ENV).toBe('string');
      expect(typeof result.value.API_VERSION).toBe('string');
      expect(typeof result.value.CORS_ORIGIN).toBe('string');
      expect(typeof result.value.LOG_LEVEL).toBe('string');
    });

    it('should preserve original values for valid inputs', () => {
      const config = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        NODE_ENV: 'production',
        PORT: 3000,
        API_VERSION: 'v1',
        CORS_ORIGIN: 'https://example.com',
        LOG_LEVEL: 'error',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };

      const result = configValidation.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toMatchObject(config);
    });
  });
});
