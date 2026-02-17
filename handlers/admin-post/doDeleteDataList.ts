import type { Request, Response } from 'express'

import deleteDataList, {
  type DeleteDataListForm
} from '../../database/app/deleteDataList.js'
import getDataListItemsAdmin from '../../database/app/getDataListItemsAdmin.js'
import getDataLists from '../../database/app/getDataLists.js'
import type { DataList } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteDataListResponse = {
  success: boolean
  errorMessage?: string
  dataLists?: DataList[]
}

export default async function handler(
  request: Request<unknown, unknown, Omit<DeleteDataListForm, 'userName'>>,
  response: Response<DoDeleteDataListResponse>
): Promise<void> {
  const form: DeleteDataListForm = {
    ...request.body,
    userName: request.session.user?.userName ?? ''
  }

  const success = await deleteDataList(form)

  let dataLists: DataList[] | undefined

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
    errorMessage: success ? undefined : 'Failed to delete data list.',
    dataLists
  })
}
