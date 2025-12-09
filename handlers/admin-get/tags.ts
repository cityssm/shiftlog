import type { Request, Response } from 'express'

import getTags from '../../database/tags/getTags.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const tags = await getTags()

  response.render('admin/tags', {
    headTitle: 'Tag Management',
    tags
  })
}
