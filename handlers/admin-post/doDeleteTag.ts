import type { Request, Response } from 'express'

import deleteTag from '../../database/tags/deleteTag.js'
import getTags from '../../database/tags/getTags.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteTagResponse =
  | {
      success: true
      tags: Awaited<ReturnType<typeof getTags>>
    }
  | {
      success: false
      message: string
    }

export default async function handler(
  request: Request,
  response: Response<DoDeleteTagResponse>
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
    } satisfies DoDeleteTagResponse)
  } else {
    response.json({
      success: false,
      message: 'Tag could not be deleted.'
    } satisfies DoDeleteTagResponse)
  }
}
