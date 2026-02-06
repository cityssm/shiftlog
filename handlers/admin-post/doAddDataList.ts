import type { Request, Response } from 'express'

import createDataList, {
  type CreateDataListForm
} from '../../database/app/createDataList.js'
import getDataLists, { type DataList } from '../../database/app/getDataLists.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddDataListResponse = {
  success: boolean
  errorMessage?: string
  dataLists?: DataList[]
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
      errorMessage:
        'Non-system data list keys must start with "user-" prefix.'
    })
    return
  }

  const form: CreateDataListForm = {
    ...request.body,
    isSystemList: false,
    userName: request.session.user?.userName ?? ''
  }

  const success = await createDataList(form, form.userName)

  let dataLists: DataList[] | undefined

  if (success) {
    dataLists = await getDataLists()
  }

  response.json({
    success,
    errorMessage: success ? undefined : 'Failed to create data list.',
    dataLists
  })
}
