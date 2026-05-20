import type { Request, Response } from 'express'

import getTagAliases from '../../database/tagAliases/getTagAliases.js'
import updateTagAlias from '../../database/tagAliases/updateTagAlias.js'
import type { TagAlias } from '../../types/record.types.js'

export type DoUpdateTagAliasResponse =
  | {
      success: false
      message: string
    }
  | {
      success: true
      tagAliases: TagAlias[]
    }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { oldTagNameAlias?: string; tagNameAlias?: string; tagName?: string }
  >,
  response: Response<DoUpdateTagAliasResponse>
): Promise<void> {
  const oldTagNameAlias = request.body.oldTagNameAlias ?? ''
  const tagNameAlias = request.body.tagNameAlias ?? ''
  const tagName = request.body.tagName ?? ''

  const success = await updateTagAlias(
    { oldTagNameAlias, tagNameAlias, tagName },
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
      message: 'Tag alias could not be updated.'
    })
  }
}
