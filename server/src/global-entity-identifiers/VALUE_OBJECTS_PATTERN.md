# Global Entity Identifiers - Value Objects Only Pattern

## Overview

The `global-entity-identifiers` module follows a **Value Objects Only Pattern** - no domain entities, just value objects for validation and plain data structures for persistence. This is consistent with the `action-types` module architecture.

## Architecture Pattern

### Key Principles

1. **No Domain Entities**: Unlike traditional DDD, this module does NOT use rich domain entities
2. **Value Objects for Validation**: Immutable value objects encapsulate validation logic
3. **Plain Data Structures**: Repositories and services work with plain TypeScript objects
4. **Service Layer Validation**: Validation happens at the service layer using value objects
5. **Repository Layer**: Pure data access, no validation logic

### Comparison with Action-Types Module

This pattern is identical to how `action-types` module works:

| Module | Value Objects | Entities | Repository Returns | Service Returns |
|--------|--------------|----------|-------------------|-----------------|
| action-types | ActionTypeName | ActionType (entity) | ActionType entity | Plain object |
| global-entity-identifiers | IdentifierName, IdentifierIcon | None | Plain object | Plain object |

**Note**: While action-types uses an entity, global-entity-identifiers uses ONLY value objects for validation, with plain objects everywhere else.

## Required Value Objects

### 1. IdentifierName

**Purpose**: Validates and encapsulates identifier names

**Location**: `server/src/domain/value-objects/identifier-name.ts`

**Implementation Pattern** (following ActionTypeName):

```typescript
export class IdentifierName {
  private static readonly MAX_LENGTH = 50;
  private static readonly MIN_LENGTH = 1;

  private constructor(private readonly value: string) {}

  public static create(name: string): IdentifierName {
    if (typeof name !== 'string') {
      throw new Error('Identifier name must be a string');
    }

    const trimmedName = name.trim();

    if (trimmedName.length < this.MIN_LENGTH) {
      throw new Error('Name cannot be empty');
    }

    if (trimmedName.length > this.MAX_LENGTH) {
      throw new Error(`Name cannot exceed ${this.MAX_LENGTH} characters`);
    }

    // Only allow ASCII characters (no emoji, accents, etc.)
    if (!this.isAsciiOnly(trimmedName)) {
      throw new Error('Names with Unicode characters are not allowed');
    }

    return new IdentifierName(trimmedName);
  }

  private static isAsciiOnly(str: string): boolean {
    return /^[\x00-\x7F]*$/.test(str);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: IdentifierName): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public valueOf(): string {
    return this.value;
  }
}
```

**Validation Rules**:
- Must be a string
- Length: 1-50 characters (after trimming)
- ASCII only (no Unicode, emoji, accented characters)
- Automatic whitespace trimming
- Case-sensitive
- Immutable

### 2. IdentifierIcon

**Purpose**: Validates and encapsulates identifier icons (URLs)

**Location**: `server/src/domain/value-objects/identifier-icon.ts`

**Implementation Pattern**:

```typescript
export class IdentifierIcon {
  private static readonly MAX_LENGTH = 500;
  private static readonly MIN_LENGTH = 1;

  private constructor(private readonly value: string) {}

  public static create(icon: string): IdentifierIcon {
    if (typeof icon !== 'string') {
      throw new Error('Identifier icon must be a string');
    }

    const trimmedIcon = icon.trim();

    if (trimmedIcon.length < this.MIN_LENGTH) {
      throw new Error('Icon cannot be empty');
    }

    if (trimmedIcon.length > this.MAX_LENGTH) {
      throw new Error(`Icon cannot exceed ${this.MAX_LENGTH} characters`);
    }

    // Basic URL format validation (optional but recommended)
    if (!this.isValidUrl(trimmedIcon)) {
      throw new Error('Icon must be a valid URL');
    }

    return new IdentifierIcon(trimmedIcon);
  }

  private static isValidUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: IdentifierIcon): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public valueOf(): string {
    return this.value;
  }
}
```

**Validation Rules**:
- Must be a string
- Length: 1-500 characters (after trimming)
- Must be a valid URL format
- Automatic whitespace trimming
- Immutable

## Usage in Service Layer

### Example: Create Operation

```typescript
async create(data: CreateGlobalEntityIdentifierData) {
  // 1. Validate using value objects
  const identifierName = IdentifierName.create(data.name);
  const identifierIcon = IdentifierIcon.create(data.icon);

  // 2. Check global uniqueness
  if (await this.repository.existsByName(identifierName.getValue())) {
    throw new ConflictError(`Global entity identifier with name '${data.name}' already exists`);
  }

  if (await this.repository.existsByIcon(identifierIcon.getValue())) {
    throw new ConflictError(`Global entity identifier with icon '${data.icon}' already exists`);
  }

  // 3. Validate entity type
  const validEntityTypes = ['habit', 'action-type'];
  if (!validEntityTypes.includes(data.entityType)) {
    throw new ValidationException('Entity type must be one of: habit, action-type');
  }

  // 4. Create using validated string values (not value objects)
  const result = await this.repository.create({
    name: identifierName.getValue(),
    icon: identifierIcon.getValue(),
    entityType: data.entityType,
    entityId: data.entityId,
  });

  // 5. Return plain object
  return result;
}
```

### Example: Update Operation

```typescript
async update(id: UUID, data: UpdateGlobalEntityIdentifierData) {
  // 1. Check if identifier exists
  const existing = await this.repository.findById(id);
  if (!existing) {
    throw new NotFoundError('Global entity identifier not found');
  }

  const updateData: any = {};

  // 2. Validate and check uniqueness for name if provided
  if (data.name !== undefined) {
    const identifierName = IdentifierName.create(data.name);

    if (identifierName.getValue() !== existing.name) {
      if (await this.repository.existsByName(identifierName.getValue())) {
        throw new ConflictError(`Global entity identifier with name '${data.name}' already exists`);
      }
      updateData.name = identifierName.getValue();
    }
  }

  // 3. Validate and check uniqueness for icon if provided
  if (data.icon !== undefined) {
    const identifierIcon = IdentifierIcon.create(data.icon);

    if (identifierIcon.getValue() !== existing.icon) {
      if (await this.repository.existsByIcon(identifierIcon.getValue())) {
        throw new ConflictError(`Global entity identifier with icon '${data.icon}' already exists`);
      }
      updateData.icon = identifierIcon.getValue();
    }
  }

  // 4. Update using validated values
  return await this.repository.update(id, updateData);
}
```

## Repository Layer

Repositories work with **plain objects** only:

```typescript
// Returns plain object from Prisma
async create(data: CreateGlobalEntityIdentifierData) {
  try {
    const result = await this.prisma.globalEntityIdentifiers.create({
      data: {
        name: data.name,
        icon: data.icon,
        entityType: data.entityType,
        entityId: data.entityId,
      },
    });

    return result; // Plain object
  } catch (error) {
    // Error handling...
  }
}
```

## Test Structure

### Repository Tests

```typescript
describe('GlobalEntityIdentifiersRepository - Value Objects Only Pattern', () => {
  // Plain string fixtures (no value objects)
  const mockName = 'Morning Exercise';
  const mockIcon = 'https://example.com/icons/exercise.png';

  // Repository returns plain objects
  it('should create and return plain object', async () => {
    const result = await repository.create({
      name: mockName,
      icon: mockIcon,
      entityType: 'habit',
      entityId: mockEntityId,
    });

    // Expect plain object, not entity
    expect(result).toEqual({
      id: expect.any(String),
      name: mockName,
      icon: mockIcon,
      entityType: 'habit',
      entityId: mockEntityId,
    });
  });
});
```

### Service Tests

```typescript
describe('GlobalEntityIdentifiersService - Value Objects Pattern', () => {
  it('should validate name using IdentifierName value object', async () => {
    const invalidData = { name: '', icon: mockIcon, entityType: 'habit', entityId: mockEntityId };

    // Value object validation happens in service
    await expect(service.create(invalidData)).rejects.toThrow('Name cannot be empty');
  });

  it('should validate icon using IdentifierIcon value object', async () => {
    const invalidData = { name: mockName, icon: '', entityType: 'habit', entityId: mockEntityId };

    await expect(service.create(invalidData)).rejects.toThrow('Icon cannot be empty');
  });
});
```

### Integration Tests

```typescript
describe('GlobalEntityIdentifiers Integration - Value Objects Pattern', () => {
  it('should enforce validation through value objects', async () => {
    // Empty name should fail validation via IdentifierName
    await expect(service.create({
      name: '',
      icon: mockIcon,
      entityType: 'habit',
      entityId: mockEntityId,
    })).rejects.toThrow();

    // Empty icon should fail validation via IdentifierIcon
    await expect(service.create({
      name: mockName,
      icon: '',
      entityType: 'habit',
      entityId: mockEntityId,
    })).rejects.toThrow();
  });
});
```

## Value Object Tests

Value objects need comprehensive test coverage similar to `ActionTypeName`:

### IdentifierName Tests

**Location**: `server/src/domain/value-objects/__tests__/identifier-name.spec.ts`

**Test Categories**:
1. **Creation Tests**: Valid names, trimming, edge cases
2. **Validation Tests**: Empty strings, too long, Unicode characters
3. **Equality Tests**: Same values, different values, case sensitivity
4. **Immutability Tests**: Value never changes
5. **Business Rules**: Casing preservation, special characters
6. **Boundaries**: Min/max lengths, trimming effects
7. **Serialization**: toString(), valueOf(), JSON.stringify()

### IdentifierIcon Tests

**Location**: `server/src/domain/value-objects/__tests__/identifier-icon.spec.ts`

**Test Categories**:
1. **Creation Tests**: Valid URLs, different protocols
2. **Validation Tests**: Empty strings, invalid URLs, too long
3. **Equality Tests**: Same URLs, different URLs
4. **Immutability Tests**: Value never changes
5. **URL Format Tests**: http, https, query parameters, fragments
6. **Boundaries**: Min/max lengths
7. **Serialization**: toString(), valueOf(), JSON.stringify()

## Benefits of This Pattern

1. **Simplicity**: No complex entity lifecycle management
2. **Validation Centralization**: All validation logic in value objects
3. **Immutability**: Value objects are immutable by design
4. **Type Safety**: Strong typing through TypeScript
5. **Testability**: Easy to test value objects in isolation
6. **Performance**: No entity hydration/dehydration overhead
7. **Consistency**: Same pattern across similar modules (action-types)

## Key Differences from Traditional DDD

| Traditional DDD | This Pattern |
|----------------|--------------|
| Rich domain entities | Plain data objects |
| Entity factories | Value object factories |
| Entity validation | Value object validation |
| Entity repositories | Data access repositories |
| Business logic in entities | Business logic in services |

## Migration Notes

When implementing this pattern:

1. Create value object files first
2. Write comprehensive value object tests
3. Update service layer to use value objects for validation
4. Ensure repository tests expect plain objects
5. Update integration tests to verify end-to-end validation
6. Document the pattern in module README

## References

- Action-Types Module: `server/src/action-types/`
- ActionTypeName Value Object: `server/src/domain/value-objects/action-type-name.ts`
- ActionTypeName Tests: `server/src/domain/value-objects/__tests__/action-type-name.spec.ts`
