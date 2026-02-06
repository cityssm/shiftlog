import type { Request, Response } from 'express'

import deleteDataList, {
  type DeleteDataListForm
} from '../../database/app/deleteDataList.js'
import getDataLists, { type DataList } from '../../database/app/getDataLists.js'

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
    dataLists = await getDataLists()
  }

  response.json({
    success,
    errorMessage: success ? undefined : 'Failed to delete data list.',
    dataLists
  })
}
