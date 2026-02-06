import type { Request, Response } from 'express'

import getDataListItems from '../../database/app/getDataListItems.js'
import type { DataListItem } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetDataListItemsResponse = {
  success: true
  items: DataListItem[]
}

export default async function handler(
  request: Request<object, object, { dataListKey: string }>,
  response: Response<DoGetDataListItemsResponse>
): Promise<void> {
  const dataListKey = request.body.dataListKey
  const userName = request.session.user?.userName

  const items = await getDataListItems(dataListKey, userName)

  response.json({
    success: true,
    items
  })
}
