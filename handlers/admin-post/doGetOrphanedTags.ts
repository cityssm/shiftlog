import type { Request, Response } from 'express'

import getOrphanedTags from '../../database/tags/getOrphanedTags.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetOrphanedTagsResponse =
  | {
      success: true
      orphanedTags: Awaited<ReturnType<typeof getOrphanedTags>>
    }
  | {
      success: false
      message: string
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
    } satisfies DoGetOrphanedTagsResponse)
  } catch {
    response.json({
      success: false,
      message: 'Error retrieving orphaned tags.'
    } satisfies DoGetOrphanedTagsResponse)
  }
}
