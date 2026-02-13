import type { Request, Response } from 'express'

import getDataListItemsAdmin, {
  type DataListItemWithDetails
} from '../../database/app/getDataListItemsAdmin.js'
import updateDataListItem, {
  type UpdateDataListItemForm
} from '../../database/app/updateDataListItem.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateDataListItemResponse = {
  success: boolean
  items?: DataListItemWithDetails[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    UpdateDataListItemForm & { dataListKey: string }
  >,
  response: Response<DoUpdateDataListItemResponse>
): Promise<void> {
  const form = {
    dataListItemId: request.body.dataListItemId,
    dataListItem: request.body.dataListItem,
    colorHex: request.body.colorHex,
    iconClass: request.body.iconClass,
    userName: request.session.user?.userName ?? '',
    userGroupId: request.body.userGroupId
  }

  const success = await updateDataListItem(form)

  let items: DataListItemWithDetails[] | undefined

  if (success) {
    items = await getDataListItemsAdmin(request.body.dataListKey)
  }

  response.json({
    success,
    items
  })
}
