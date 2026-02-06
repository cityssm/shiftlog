import type { Request, Response } from 'express'

import getDataLists, { type DataList } from '../../database/app/getDataLists.js'
import updateDataList, {
  type UpdateDataListForm
} from '../../database/app/updateDataList.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateDataListResponse = {
  success: boolean
  errorMessage?: string
  dataLists?: DataList[]
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

  let dataLists: DataList[] | undefined

  if (success) {
    dataLists = await getDataLists()
  }

  response.json({
    success,
    errorMessage: success ? undefined : 'Failed to update data list.',
    dataLists
  })
}
