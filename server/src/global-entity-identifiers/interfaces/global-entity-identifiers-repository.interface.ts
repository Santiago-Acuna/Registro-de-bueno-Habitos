import { GlobalEntityIdentifier } from '../../domain/entities/global-entity-identifier.entity';
import { PaginatedResult, PaginationParams, UUID } from '../../domain/shared/types/common';

export interface CreateGlobalEntityIdentifierData {
  name: string;
  icon: string;
  entityType: string;
  entityId: UUID;
}

export interface UpdateGlobalEntityIdentifierData {
  name?: string;
  icon?: string;
}

export interface GlobalEntityIdentifierFilterOptions {
  entityType?: string;
  namePrefix?: string;
}

export interface IGlobalEntityIdentifiersRepository {
  create(data: CreateGlobalEntityIdentifierData): Promise<GlobalEntityIdentifier>;
  findById(id: UUID): Promise<GlobalEntityIdentifier | null>;
  findByName(name: string): Promise<GlobalEntityIdentifier | null>;
  findByIcon(icon: string): Promise<GlobalEntityIdentifier | null>;
  findByEntityTypeAndId(
    entityType: string,
    entityId: UUID
  ): Promise<GlobalEntityIdentifier | null>;
  findAll(
    params: PaginationParams,
    filters?: GlobalEntityIdentifierFilterOptions
  ): Promise<PaginatedResult<GlobalEntityIdentifier>>;
  findByEntityType(
    entityType: string,
    params: PaginationParams
  ): Promise<PaginatedResult<GlobalEntityIdentifier>>;
  update(id: UUID, data: UpdateGlobalEntityIdentifierData): Promise<GlobalEntityIdentifier>;
  delete(id: UUID): Promise<void>;
  existsByName(name: string): Promise<boolean>;
  existsByIcon(icon: string): Promise<boolean>;
  existsByNameAndIcon(name: string, icon: string): Promise<boolean>;
  count(filters?: GlobalEntityIdentifierFilterOptions): Promise<number>;
  countByEntityType(entityType: string): Promise<number>;
  findByNamePrefix(namePrefix: string, limit: number): Promise<GlobalEntityIdentifier[]>;
}
