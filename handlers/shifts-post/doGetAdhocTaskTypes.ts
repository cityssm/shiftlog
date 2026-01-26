import type { Request, Response } from 'express'

import getAdhocTaskTypeDataListItems from '../../database/adhocTasks/getAdhocTaskTypeDataListItems.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetAdhocTaskTypesResponse = {
  success: boolean
  adhocTaskTypes: AdhocTaskTypeDataListItem[]
}

export default async function handler(
  request: Request,
  response: Response<DoGetAdhocTaskTypesResponse>
): Promise<void> {
  const adhocTaskTypes = await getAdhocTaskTypeDataListItems(
    request.session.user
  )

  response.json({
    success: true,
    adhocTaskTypes
  } satisfies DoGetAdhocTaskTypesResponse)
}
