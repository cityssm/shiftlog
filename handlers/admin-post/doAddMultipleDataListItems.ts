import type { Request, Response } from 'express'

import addDataListItem, {
  type AddDataListItemForm
} from '../../database/app/addDataListItem.js'
import getDataListItemsAdmin, {
  type DataListItemWithDetails
} from '../../database/app/getDataListItemsAdmin.js'

export interface AddMultipleDataListItemsForm {
  dataListKey: string
  dataListItems: string
  userGroupId?: number | string | null
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddMultipleDataListItemsResponse = {
  success: boolean
  addedCount?: number
  skippedCount?: number
  items?: DataListItemWithDetails[]
}

export default async function handler(
  request: Request<unknown, unknown, AddMultipleDataListItemsForm>,
  response: Response<DoAddMultipleDataListItemsResponse>
): Promise<void> {
  const { dataListKey, dataListItems, userGroupId } = request.body
  const userName = request.session.user?.userName ?? ''

  // Split the items by newline and filter out empty lines
  const itemLines = dataListItems
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  let addedCount = 0
  let skippedCount = 0

  // Process each item
  for (const itemLine of itemLines) {
    const form: AddDataListItemForm = {
      dataListKey,
      dataListItem: itemLine,
      userGroupId,
      userName
    }

    const success = await addDataListItem(form)

    if (success) {
      addedCount += 1
    } else {
      skippedCount += 1
    }
  }

  // Get the updated list of items
  const items = await getDataListItemsAdmin(dataListKey)

  response.json({
    success: true,
    addedCount,
    skippedCount,
    items
  })
}
