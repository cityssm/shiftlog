import type { Request, Response } from 'express'

import getDataListItemsAdmin, {
  type DataListItemWithDetails
} from '../../database/app/getDataListItemsAdmin.js'
import updateDataListItem, {
  type UpdateDataListItemForm
} from '../../database/app/updateDataListItem.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateDataListItemResponse = {
  items?: DataListItemWithDetails[]
  success: boolean
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
    colorHex: request.body.colorHex,
    dataListItem: request.body.dataListItem,
    dataListItemId: request.body.dataListItemId,
    iconClass: request.body.iconClass,
    userGroupId: request.body.userGroupId,
    userName: request.session.user?.userName ?? ''
  }

  const success = await updateDataListItem(form)

  let items: DataListItemWithDetails[] | undefined

  if (success) {
    items = await getDataListItemsAdmin(request.body.dataListKey)
  }

  response.json({
    items,
    success
  })
}
