import type { Request, Response } from 'express'

import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js'
import updateDataListItem, {
  type UpdateDataListItemForm
} from '../../database/app/updateDataListItem.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateDataListItemResponse = {
  success: boolean
  items?: Awaited<ReturnType<typeof getDataListItemsAdmin>>
}

export default async function handler(
  request: Request<unknown, unknown, UpdateDataListItemForm & { dataListKey: string }>,
  response: Response<DoUpdateDataListItemResponse>
): Promise<void> {
  const form = {
    dataListItemId: request.body.dataListItemId,
    dataListItem: request.body.dataListItem,
    userName: request.session.user?.userName ?? '',
    userGroupId: request.body.userGroupId
  }

  const success = await updateDataListItem(form)

  let items: Awaited<ReturnType<typeof getDataListItemsAdmin>> | undefined

  if (success) {
    items = await getDataListItemsAdmin(request.body.dataListKey)
  }

  response.json({
    success,
    items
  } satisfies DoUpdateDataListItemResponse)
}
