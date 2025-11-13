import type { Request, Response } from 'express'

import addDataListItem, {
  type AddDataListItemForm
} from '../../database/app/addDataListItem.js'
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js'

export default async function handler(
  request: Request<unknown, unknown, AddDataListItemForm>,
  response: Response
): Promise<void> {
  const form = {
    ...request.body,
    userName: request.session.user?.userName ?? ''
  }

  const success = await addDataListItem(form)

  let items: Awaited<ReturnType<typeof getDataListItemsAdmin>> | undefined

  if (success) {
    items = await getDataListItemsAdmin(form.dataListKey)
  }

  response.json({
    success,
    items
  })
}
