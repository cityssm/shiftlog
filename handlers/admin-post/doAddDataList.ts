import type { Request, Response } from 'express'

import createDataList, {
  type CreateDataListForm
} from '../../database/app/createDataList.js'
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js'
import getDataLists, { type DataList } from '../../database/app/getDataLists.js'
import recoverDataList from '../../database/app/recoverDataList.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddDataListResponse = {
  success: boolean
  errorMessage?: string
  dataLists?: DataListWithItems[]
  wasRecovered?: boolean
}

interface DataListWithItems extends DataList {
  items: Array<{
    dataListItemId: number
    dataListKey: string
    dataListItem: string
    orderNumber: number
    userGroupId: number | null
  }>
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    Omit<CreateDataListForm, 'isSystemList' | 'userName'>
  >,
  response: Response<DoAddDataListResponse>
): Promise<void> {
  // Validate that the dataListKey starts with "user-"
  if (!request.body.dataListKey.startsWith('user-')) {
    response.json({
      success: false,

      errorMessage: 'Non-system data list keys must start with "user-" prefix.'
    })

    return
  }

  const userName = request.session.user?.userName ?? ''

  // First, try to recover a deleted data list with the same key
  const wasRecovered = await recoverDataList({
    dataListKey: request.body.dataListKey,
    dataListName: request.body.dataListName,
    userName
  })

  let success = wasRecovered

  // If not recovered, create a new data list
  if (!wasRecovered) {
    const form: CreateDataListForm = {
      ...request.body,
      isSystemList: false
    }

    success = await createDataList(form, userName)
  }

  let dataLists: DataListWithItems[] | undefined

  if (success) {
    const lists = await getDataLists()

    // Get items for each data list
    dataLists = await Promise.all(
      lists.map(async (dataList) => ({
        ...dataList,
        items: await getDataListItemsAdmin(dataList.dataListKey)
      }))
    )
  }

  response.json({
    success,
    errorMessage: success ? undefined : 'Failed to create data list.',
    dataLists,
    wasRecovered
  })
}
