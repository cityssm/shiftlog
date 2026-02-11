import type { Request, Response } from 'express'

import { getCachedSettings } from '../../helpers/cache/settings.cache.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const settings = await getCachedSettings()

  response.render('admin/settings', {
    headTitle: 'Settings Management',
    section: 'admin',

    settings
  })
}
