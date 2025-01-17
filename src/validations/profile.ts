import { EntityType } from 'dcl-catalyst-commons'
import sharp from 'sharp'
import { ADR_45_TIMESTAMP } from '.'
import { OK, Validation, validationFailed, ValidationResponse } from '../types'

/** Validate that given profile deployment includes a face256 thumbnail with valid size */
const defaultThumbnailSize = 256
export const faceThumbnail: Validation = {
  validate: async ({ deployment, externalCalls }) => {
    if (deployment.entity.timestamp < ADR_45_TIMESTAMP) return OK

    const errors: string[] = []
    const allAvatars: any[] = deployment.entity.metadata?.avatars ?? []

    for (const avatar of allAvatars) {
      const hash = avatar.avatar.snapshots.face256
      if (!hash)
        return validationFailed(`Couldn't find hash for face256 thumbnail file with name: 'face256'`)

      const isAlreadyStored = (await externalCalls.isContentStoredAlready([hash])).get(hash) ?? false
      if (isAlreadyStored) {
        return OK
      }
      // check size
      const thumbnailBuffer = deployment.files.get(hash)
      if (!thumbnailBuffer) return validationFailed(`Couldn't find thumbnail file with hash: ${hash}`)
      try {
        const { width, height, format } = await sharp(thumbnailBuffer).metadata()
        if (!format || format !== 'png') errors.push(`Invalid or unknown image format. Only 'PNG' format is accepted.`)
        if (!width || !height) {
          errors.push(`Couldn't validate thumbnail size for file 'face256'`)
        } else if (width !== defaultThumbnailSize || height !== defaultThumbnailSize) {
          errors.push(`Invalid face256 thumbnail image size (width = ${width} / height = ${height})`)
        }
      } catch (e) {
        errors.push(`Couldn't parse face256 thumbnail, please check image format.`)
      }
    }
    return errors.length > 0 ? validationFailed(...errors) : OK
  },
}

/**
 * Validate that given profile deployment includes the face256 file with the correct size
 * * @public
 */
export const profile: Validation = {
  validate: async (args) => {
    if (args.deployment.entity.type !== EntityType.PROFILE) return OK
    const response: ValidationResponse = await faceThumbnail.validate(args)

    if (!response.ok) return response
    return OK
  },
}
