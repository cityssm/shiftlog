import type { Request, Response } from 'express'

import getOrphanedTags, {
  type OrphanedTag
} from '../../database/tags/getOrphanedTags.js'

export type DoGetOrphanedTagsResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      orphanedTags: OrphanedTag[]
    }

export default async function handler(
  _request: Request,
  response: Response<DoGetOrphanedTagsResponse>
): Promise<void> {
  try {
    const orphanedTags = await getOrphanedTags()

    response.json({
      success: true,
      orphanedTags
    })
  } catch {
    response.json({
      success: false,
      message: 'Error retrieving orphaned tags.'
    })
  }
}
