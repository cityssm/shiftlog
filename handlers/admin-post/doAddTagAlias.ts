import type { Request, Response } from 'express'

import addTagAlias from '../../database/tagAliases/addTagAlias.js'
import getTagAliases from '../../database/tagAliases/getTagAliases.js'
import type { TagAlias } from '../../types/record.types.js'

export type DoAddTagAliasResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      tagAliases: TagAlias[]
    }

export default async function handler(
  request: Request<unknown, unknown, { tagNameAlias?: string; tagName?: string }>,
  response: Response<DoAddTagAliasResponse>
): Promise<void> {
  const tagNameAlias = request.body.tagNameAlias ?? ''
  const tagName = request.body.tagName ?? ''

  const success = await addTagAlias(
    { tagNameAlias, tagName },
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
      message: 'Tag alias could not be added. Alias may already exist.'
    })
  }
}
