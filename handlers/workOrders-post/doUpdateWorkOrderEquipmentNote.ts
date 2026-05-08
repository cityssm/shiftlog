import type { Request, Response } from 'express'

import updateWorkOrderEquipmentNote from '../../database/workOrders/updateWorkOrderEquipmentNote.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

interface UpdateWorkOrderEquipmentNoteForm {
  equipmentNumber: string
  workOrderEquipmentNote: string
  workOrderId: number | string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateWorkOrderEquipmentNoteResponse = {
  success: boolean

  errorMessage?: string
}

export default async function handler(
  request: Request<unknown, unknown, UpdateWorkOrderEquipmentNoteForm>,
  response: Response<DoUpdateWorkOrderEquipmentNoteResponse>
): Promise<void> {
  const userName = request.session.user?.userName

  if (userName === undefined || userName === '') {
    response.json({
      success: false,

      errorMessage: `Failed to update equipment note for ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
    })
    return
  }

  const success = await updateWorkOrderEquipmentNote(request.body, userName)

  response.json({
    success,
    ...(success
      ? {}
      : {
          errorMessage: `Failed to update equipment note for ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        })
  })
}
