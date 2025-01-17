## API Report File for "@dcl/content-validator"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { AuditInfo } from 'dcl-catalyst-commons';
import { ContentFileHash } from 'dcl-catalyst-commons';
import { Entity } from 'dcl-catalyst-commons';
import { EntityId } from 'dcl-catalyst-commons';
import { Fetcher } from 'dcl-catalyst-commons';
import { ILoggerComponent } from '@well-known-components/interfaces';

// @public
export const ADR_45_TIMESTAMP: number;

// @public (undocumented)
export const calculateDeploymentSize: (deployment: DeploymentToValidate, externalCalls: ExternalCalls) => Promise<number | string>;

// @public (undocumented)
export type ConditionalValidation = {
    predicate: (args: ValidationArgs) => ValidationResponse | Promise<ValidationResponse>;
};

// @public (undocumented)
export const conditionalValidation: (condition: ConditionalValidation) => Validation;

// @public
export type ContentValidatorComponents = {
    logs: ILoggerComponent;
};

// @public
export const createValidator: (externalCalls: ExternalCalls, components?: Pick<ContentValidatorComponents, "logs"> | undefined) => Validator;

// @public
export type DeploymentToValidate = {
    entity: Entity;
    files: Map<ContentFileHash, Uint8Array>;
    auditInfo: LocalDeploymentAuditInfo;
};

// @public (undocumented)
export type EntityWithEthAddress = Entity & {
    ethAddress: string;
};

// @public (undocumented)
export type Errors = string[];

// @public
export type ExternalCalls = {
    isContentStoredAlready: (hashes: ContentFileHash[]) => Promise<Map<ContentFileHash, boolean>>;
    fetchContentFileSize: (hash: string) => Promise<number | undefined>;
    validateSignature: (entityId: EntityId, auditInfo: LocalDeploymentAuditInfo, timestamp: number) => Promise<{
        ok: boolean;
        message?: string;
    }>;
    ownerAddress: (auditInfo: LocalDeploymentAuditInfo) => string;
    isAddressOwnedByDecentraland: (address: string) => boolean;
    queryGraph: Fetcher['queryGraph'];
    subgraphs: {
        L1: {
            landManager: string;
            blocks: string;
            collections: string;
        };
        L2: {
            blocks: string;
            collections: string;
            thirdPartyRegistry: string;
        };
    };
};

// @public (undocumented)
export const fromErrors: (...errors: Errors) => ValidationResponse;

// @public
export const LEGACY_CONTENT_MIGRATION_TIMESTAMP = 1582167600000;

// @public (undocumented)
export type LocalDeploymentAuditInfo = Pick<AuditInfo, 'authChain'>;

// @public (undocumented)
export const OK: ValidationResponse;

// @public
export const statefulValidations: readonly [Validation, Validation, Validation, Validation, Validation, Validation];

// @public
export const statelessValidations: readonly [Validation, Validation, Validation];

// @public (undocumented)
export const validateInRow: (validationArgs: ValidationArgs, ...validations: Validation[]) => Promise<ValidationResponse>;

// @public (undocumented)
export type Validation = {
    validate: (args: ValidationArgs, logs?: ILoggerComponent.ILogger) => ValidationResponse | Promise<ValidationResponse>;
};

// @public (undocumented)
export type ValidationArgs = {
    deployment: DeploymentToValidate;
    externalCalls: ExternalCalls;
};

// @public (undocumented)
export const validationFailed: (...error: string[]) => ValidationResponse;

// @public (undocumented)
export type ValidationResponse = {
    ok: boolean;
    errors?: Errors;
};

// @public
export const validations: readonly [Validation, Validation, Validation, Validation, Validation, Validation, Validation, Validation, Validation];

// @public
export interface Validator {
    // (undocumented)
    validate(deployment: DeploymentToValidate): Promise<ValidationResponse>;
}

// @public (undocumented)
export type Warnings = string[];

// (No @packageDocumentation comment for this package)

```
