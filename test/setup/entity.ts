import { Entity, EntityType, EntityVersion } from 'dcl-catalyst-commons'

export const buildProfileEntity = (entity?: Partial<Entity>): Entity =>
  buildEntity({
    version: EntityVersion.V4,
    type: EntityType.PROFILE,
    ...entity,
  })

export const buildSceneEntity = (entity?: Partial<Entity>): Entity =>
  buildEntity({
    version: EntityVersion.V4,
    type: EntityType.SCENE,
    ...entity,
  })

export const buildWearableEntity = (entity?: Partial<Entity>): Entity =>
  buildEntity({
    version: EntityVersion.V4,
    type: EntityType.SCENE,
    ...entity,
  })

export const buildEntity = (entity?: Partial<Entity>): Entity => ({
  version: EntityVersion.V4,
  type: EntityType.PROFILE,
  pointers: [],
  timestamp: Date.now(),
  id: 'bafybeihz4c4cf4icnlh6yjtt7fooaeih3dkv2mz6umod7dybenzmsxkzvq',
  ...entity,
})