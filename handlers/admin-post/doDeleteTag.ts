import type { Request, Response } from 'express'

import deleteTag from '../../database/tags/deleteTag.js'
import getTags from '../../database/tags/getTags.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const tagName = (request.body.tagName as string) || ''

  const success = await deleteTag(
    tagName,
    request.session.user as User
  )

  if (success) {
    const tags = await getTags()
    response.json({
      success: true,
      tags
    })
  } else {
    response.json({
      success: false,
      message: 'Tag could not be deleted.'
    })
  }
}
