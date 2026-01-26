import type { Request, Response } from 'express'

import deleteDataListItem, {
  type DeleteDataListItemForm
} from '../../database/app/deleteDataListItem.js'
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteDataListItemResponse = {
  success: boolean
  items?: Awaited<ReturnType<typeof getDataListItemsAdmin>>
}

export default async function handler(
  request: Request<unknown, unknown, DeleteDataListItemForm & { dataListKey: string }>,
  response: Response<DoDeleteDataListItemResponse>
): Promise<void> {
  const form = {
    dataListItemId: request.body.dataListItemId,
    userName: request.session.user?.userName ?? ''
  }

  const success = await deleteDataListItem(form)

  let items: Awaited<ReturnType<typeof getDataListItemsAdmin>> | undefined

  if (success) {
    items = await getDataListItemsAdmin(request.body.dataListKey)
  }

  response.json({
    success,
    items
  } satisfies DoDeleteDataListItemResponse)
}
