import { UUID } from '../shared/types/common';
import { IdentifierIcon } from '../value-objects/identifier-icon';
import { IdentifierName } from '../value-objects/identifier-name';

export class GlobalEntityIdentifier {
  constructor(
    public readonly id: UUID,
    public readonly name: IdentifierName,
    public readonly icon: IdentifierIcon,
    public readonly entityType: string,
    public readonly entityId: UUID
  ) {
    this.validateEntityType(entityType);
  }

  private validateEntityType(entityType: string): void {
    const validTypes = ['habit', 'action_type'];
    if (!validTypes.includes(entityType.toLowerCase())) {
      throw new Error(`Invalid entity type: ${entityType}. Must be one of: ${validTypes.join(', ')}`);
    }
  }

  public equals(other: GlobalEntityIdentifier): boolean {
    return this.id === other.id;
  }
}
