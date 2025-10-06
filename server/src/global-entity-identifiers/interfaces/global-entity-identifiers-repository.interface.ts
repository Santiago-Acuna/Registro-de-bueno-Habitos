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
  orderBy?: string;
}

export interface GlobalEntityIdentifierData {
  id: string;
  name: string;
  icon: string;
  entityType: string;
  entityId: string;
}

export interface IGlobalEntityIdentifiersRepository {
  create(data: CreateGlobalEntityIdentifierData): Promise<GlobalEntityIdentifierData>;
  findById(id: UUID): Promise<GlobalEntityIdentifierData | null>;
  findByName(name: string): Promise<GlobalEntityIdentifierData | null>;
  findByIcon(icon: string): Promise<GlobalEntityIdentifierData | null>;
  findByEntityTypeAndId(
    entityType: string,
    entityId: UUID
  ): Promise<GlobalEntityIdentifierData | null>;
  findAll(
    params?: PaginationParams | GlobalEntityIdentifierFilterOptions,
    filters?: GlobalEntityIdentifierFilterOptions
  ): Promise<PaginatedResult<GlobalEntityIdentifierData> | GlobalEntityIdentifierData[]>;
  findByEntityType(
    entityType: string,
    params: PaginationParams
  ): Promise<PaginatedResult<GlobalEntityIdentifierData>>;
  update(id: UUID, data: UpdateGlobalEntityIdentifierData): Promise<GlobalEntityIdentifierData>;
  delete(id: UUID): Promise<void>;
  existsByName(name: string): Promise<boolean>;
  existsByIcon(icon: string): Promise<boolean>;
  existsByNameAndIcon(name: string, icon: string): Promise<boolean>;
  count(filters?: GlobalEntityIdentifierFilterOptions): Promise<number>;
  countByEntityType(entityType: string): Promise<number>;
  findByNamePrefix(namePrefix: string, limit: number): Promise<GlobalEntityIdentifierData[]>;
}
