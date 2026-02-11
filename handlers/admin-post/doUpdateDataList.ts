import type { Request, Response } from 'express'

import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js'
import getDataLists, { type DataList } from '../../database/app/getDataLists.js'
import updateDataList, {
  type UpdateDataListForm
} from '../../database/app/updateDataList.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateDataListResponse = {
  success: boolean
  errorMessage?: string
  dataLists?: DataListWithItems[]
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
  request: Request<unknown, unknown, Omit<UpdateDataListForm, 'userName'>>,
  response: Response<DoUpdateDataListResponse>
): Promise<void> {
  const form: UpdateDataListForm = {
    ...request.body,
    userName: request.session.user?.userName ?? ''
  }

  const success = await updateDataList(form)

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
    errorMessage: success ? undefined : 'Failed to update data list.',
    dataLists
  })
}
