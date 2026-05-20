import type { Request, Response } from 'express'

import { getCachedTags } from '../../helpers/cache/tags.cache.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const tags = await getCachedTags()

  response.render('admin/tags', {
    headTitle: 'Tag Management',
    section: 'admin',

    tags
  })
}
