import type { Request, Response } from 'express'

import deleteTagAlias from '../../database/tags/deleteTagAlias.js'
import getTagAliases from '../../database/tags/getTagAliases.js'
import type { TagAlias } from '../../types/record.types.js'

export type DoDeleteTagAliasResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      tagAliases: TagAlias[]
    }

export default async function handler(
  request: Request<unknown, unknown, { tagNameAlias?: string }>,
  response: Response<DoDeleteTagAliasResponse>
): Promise<void> {
  const tagNameAlias = request.body.tagNameAlias ?? ''

  const success = await deleteTagAlias(
    tagNameAlias,
    request.session.user as User
  )

  if (success) {
    const tagAliases = await getTagAliases()

    response.json({
      success: true,
      tagAliases
    })
  } else {
    response.json({
      success: false,
      message: 'Tag alias could not be deleted.'
    })
  }
}
