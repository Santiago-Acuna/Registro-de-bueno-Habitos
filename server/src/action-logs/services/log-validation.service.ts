import { Injectable, Logger } from '@nestjs/common';

import { UUID } from '../../domain/shared/types/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ValidationException } from '../../infrastructure/exceptions/app.exceptions';

interface ValidationFunction {
  name: string;
  function: string;
  isForFront: boolean;
}

interface LogColumn {
  name: string;
  type: 'text' | 'number' | 'boolean';
  validations: ValidationFunction[];
}

@Injectable()
export class LogValidationService {
  private readonly logger = new Logger(LogValidationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Converts snake_case to camelCase
   */
  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Validates logTypeInfo data against backend validation functions for a specific log type
   * @param logTypeId - The UUID of the log type
   * @param logTypeInfo - The data to validate
   * @throws ValidationException if validation fails
   */
  async validateLogTypeInfo(logTypeId: UUID, logTypeInfo: Record<string, unknown>): Promise<void> {
    this.logger.log(`Validating logTypeInfo for log type: ${logTypeId}`);

    // Get all log columns and their validation functions for this log type
    const logColumns = await this.prisma.logColumns.findMany({
      where: { logTypeId },
      include: {
        logColumnValidations: {
          include: {
            validationFunctions: true,
          },
        },
      },
    });

    if (logColumns.length === 0) {
      this.logger.warn(`No log columns found for log type: ${logTypeId}`);
      return;
    }

    // Map to a more usable structure (convert snake_case column names to camelCase)
    const columnMap = new Map<string, LogColumn>();
    for (const column of logColumns) {
      const validations = column.logColumnValidations
        .filter(v => !v.validationFunctions.isForFront) // Only backend validations
        .map(v => ({
          name: v.validationFunctions.name,
          function: v.validationFunctions.function,
          isForFront: v.validationFunctions.isForFront,
        }));

      const camelCaseName = this.snakeToCamel(column.name);
      columnMap.set(camelCaseName, {
        name: camelCaseName,
        type: column.type as 'text' | 'number' | 'boolean',
        validations,
      });
    }

    // Validate each field in logTypeInfo
    const errors: string[] = [];

    for (const [fieldName, fieldValue] of Object.entries(logTypeInfo)) {
      const column = columnMap.get(fieldName);

      if (!column) {
        // Field not defined in log columns - skip or warn
        this.logger.warn(
          `Field '${fieldName}' not defined in log columns for log type: ${logTypeId}`
        );
        continue;
      }

      // Run backend validations for this field
      for (const validation of column.validations) {
        try {
          const isValid = this.executeValidation(validation.function, fieldValue, fieldName);
          if (!isValid) {
            errors.push(`Field '${fieldName}' failed validation: ${validation.name}`);
          }
        } catch (error) {
          this.logger.error(
            `Error executing validation ${validation.name} for field ${fieldName}:`,
            error
          );
          errors.push(`Field '${fieldName}' validation error: ${validation.name}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationException(`Log type info validation failed: ${errors.join(', ')}`);
    }

    this.logger.log(`Validation successful for log type: ${logTypeId}`);
  }

  /**
   * Executes a validation function
   * @param functionCode - The validation function code
   * @param value - The value to validate
   * @param fieldName - The field name being validated
   * @returns boolean indicating if validation passed
   */
  private executeValidation(functionCode: string, value: unknown, fieldName: string): boolean {
    try {
      // Create a safe execution context
      // The function should return true if valid, false if invalid
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const validationFn = new Function('value', 'fieldName', functionCode);
      return validationFn(value, fieldName) === true;
    } catch (error) {
      this.logger.error(`Error executing validation for field ${fieldName}:`, error);
      return false;
    }
  }

  /**
   * Gets the log type name for a given log type ID
   * Used to determine which specialized log table to use
   */
  async getLogTypeName(logTypeId: UUID): Promise<string | null> {
    const logType = await this.prisma.logTypes.findUnique({
      where: { id: logTypeId },
      select: { name: true },
    });

    return logType?.name ?? null;
  }
}
