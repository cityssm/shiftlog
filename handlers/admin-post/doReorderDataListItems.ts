import type { Request, Response } from 'express'

import getDataListItemsAdmin, { type DataListItemWithDetails } from '../../database/app/getDataListItemsAdmin.js'
import reorderDataListItems, {
  type ReorderDataListItemsForm
} from '../../database/app/reorderDataListItems.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoReorderDataListItemsResponse = {
  success: boolean
  items?: DataListItemWithDetails[]
}

export default async function handler(
  request: Request<unknown, unknown, ReorderDataListItemsForm>,
  response: Response<DoReorderDataListItemsResponse>
): Promise<void> {
  const form = {
    ...request.body,
    userName: request.session.user?.userName ?? ''
  }

  const success = await reorderDataListItems(form)

  let items: DataListItemWithDetails[] | undefined

  if (success) {
    items = await getDataListItemsAdmin(form.dataListKey)
  }

  response.json({
    success,
    items
  } satisfies DoReorderDataListItemsResponse)
}
