import type { Request, Response } from 'express'

import addDataListItem, {
  type AddDataListItemForm
} from '../../database/app/addDataListItem.js'
import getDataListItemsAdmin, {
  type DataListItemWithDetails
} from '../../database/app/getDataListItemsAdmin.js'

interface DoAddMultipleDataListItemsForm {
  dataListItems: string
  dataListKey: string
  userGroupId?: number | string | null
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddMultipleDataListItemsResponse = {
  addedCount?: number
  items?: DataListItemWithDetails[]
  skippedCount?: number
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, DoAddMultipleDataListItemsForm>,
  response: Response<DoAddMultipleDataListItemsResponse>
): Promise<void> {
  const { dataListItems, dataListKey, userGroupId } = request.body
  const userName = request.session.user?.userName ?? ''

  // Split items by newline and trim/filter empty lines
  const itemsToAdd = dataListItems
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item !== '')

  let addedCount = 0
  let skippedCount = 0

  // Add each item
  for (const dataListItem of itemsToAdd) {
    const form: AddDataListItemForm = {
      dataListItem,
      dataListKey,
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

  // Get updated items list
  const items = await getDataListItemsAdmin(dataListKey)

  response.json({
    addedCount,
    items,
    skippedCount,
    success: true
  })
}
