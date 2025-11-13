import type { Request, Response } from 'express'

import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js'
import reorderDataListItems, {
  type ReorderDataListItemsForm
} from '../../database/app/reorderDataListItems.js'

export default async function handler(
  request: Request<unknown, unknown, ReorderDataListItemsForm>,
  response: Response
): Promise<void> {
  const form = {
    ...request.body,
    userName: request.session.user?.userName ?? ''
  }

  const success = await reorderDataListItems(form)

  let items: Awaited<ReturnType<typeof getDataListItemsAdmin>> | undefined

  if (success) {
    items = await getDataListItemsAdmin(form.dataListKey)
  }

  response.json({
    success,
    items
  })
}
