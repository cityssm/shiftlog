import type { Request, Response } from 'express'

import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const shiftTypes = await getShiftTypeDataListItems(
    request.session.user?.userName ?? ''
  )

  response.render('shifts/edit', {
    headTitle: `Create New ${getConfigProperty('shifts.sectionNameSingular')}`,
    isCreate: true,
    shiftTypes
  })
}
