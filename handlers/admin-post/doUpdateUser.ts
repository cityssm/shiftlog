/* eslint-disable @typescript-eslint/naming-convention -- Underscores */

import type { Request, Response } from 'express'

import updateUser from '../../database/users/updateUser.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateUserResponse = {
  message: string
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoUpdateUserResponse>
): Promise<void> {
  const {
    userName,

    isActive = '0',

    shifts_canView = '0',
    shifts_canUpdate = '0',
    shifts_canManage = '0',

    workOrders_canView = '0',
    workOrders_canUpdate = '0',
    workOrders_canManage = '0',

    timesheets_canView = '0',
    timesheets_canUpdate = '0',
    timesheets_canManage = '0',

    isAdmin = '0'
  } = request.body as {
    userName: string

    isActive?: string

    shifts_canView?: string
    shifts_canUpdate?: string
    shifts_canManage?: string

    workOrders_canView?: string
    workOrders_canUpdate?: string
    workOrders_canManage?: string

    timesheets_canView?: string
    timesheets_canUpdate?: string
    timesheets_canManage?: string

    isAdmin?: string
  }

  try {
    const success = await updateUser(
      {
        userName,

        isActive: isActive === '1',

        shifts_canView: shifts_canView === '1',
        shifts_canUpdate: shifts_canUpdate === '1',
        shifts_canManage: shifts_canManage === '1',

        workOrders_canView: workOrders_canView === '1',
        workOrders_canUpdate: workOrders_canUpdate === '1',
        workOrders_canManage: workOrders_canManage === '1',

        timesheets_canView: timesheets_canView === '1',
        timesheets_canUpdate: timesheets_canUpdate === '1',
        timesheets_canManage: timesheets_canManage === '1',

        isAdmin: isAdmin === '1'
      },
      request.session.user as User
    )

    if (success) {
      response.json({
        message: 'User updated successfully',
        success: true
      })
    } else {
      response.status(404).json({
        message: 'User not found',
        success: false
      })
    }
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to update user',
      success: false
    })
  }
}
