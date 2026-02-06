import type { Request, Response } from 'express'

import getDataListItems from '../../database/app/getDataListItems.js'

export default async function handler(
  request: Request<{ apiKey: string; dataListKey: string }>,
  response: Response
): Promise<void> {
  const dataListKey = request.params.dataListKey
  const userName = request.session.user?.userName

  const items = await getDataListItems(dataListKey, userName)

  response.json(items)
}
