import type { Request, Response } from 'express'

import addDataListItem, {
  type AddDataListItemForm
} from '../../database/app/addDataListItem.js'
import getDataListItemsAdmin, {
  type DataListItemWithDetails
} from '../../database/app/getDataListItemsAdmin.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddDataListItemResponse = {
  success: boolean
  items?: DataListItemWithDetails[]
}

export default async function handler(
  request: Request<unknown, unknown, AddDataListItemForm>,
  response: Response<DoAddDataListItemResponse>
): Promise<void> {
  const form = {
    ...request.body,
    userName: request.session.user?.userName ?? ''
  }

  const success = await addDataListItem(form)

  let items: DataListItemWithDetails[] | undefined

  if (success) {
    items = await getDataListItemsAdmin(form.dataListKey)
  }

  response.json({
    success,

    items
  } satisfies DoAddDataListItemResponse)
}
