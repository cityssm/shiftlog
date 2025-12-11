import type { Request, Response } from 'express'

import getOrphanedTags from '../../database/tags/getOrphanedTags.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const orphanedTags = await getOrphanedTags()

  response.json({
    success: true,
    orphanedTags
  })
}
