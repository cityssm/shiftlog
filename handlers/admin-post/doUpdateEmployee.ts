/* eslint-disable @typescript-eslint/naming-convention */

import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import updateEmployee from '../../database/employees/updateEmployee.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const {
    emailAddress,
    employeeNumber,
    firstName,
    isSupervisor = '0',
    recordSync_isSynced = '0',
    lastName,
    phoneNumber,
    phoneNumberAlternate,
    userGroupId,
    userName
  } = request.body as {
    emailAddress?: string
    employeeNumber: string
    firstName: string
    isSupervisor?: string
    recordSync_isSynced?: string
    lastName: string
    phoneNumber?: string
    phoneNumberAlternate?: string
    userGroupId?: string
    userName?: string
  }

  try {
    const success = await updateEmployee(
      {
        emailAddress: emailAddress === '' ? undefined : emailAddress,
        employeeNumber,
        firstName,
        isSupervisor: isSupervisor === '1',
        recordSync_isSynced: recordSync_isSynced === '1',
        lastName,
        phoneNumber: phoneNumber === '' ? undefined : phoneNumber,
        phoneNumberAlternate:
          phoneNumberAlternate === '' ? undefined : phoneNumberAlternate,
        userGroupId:
          userGroupId === undefined || userGroupId === ''
            ? undefined
            : Number.parseInt(userGroupId, 10),
        userName: userName === '' ? undefined : userName
      },
      request.session.user as User
    )

    if (success) {
      const employees = await getEmployees()

      response.json({
        message: 'Employee updated successfully',
        success: true,
        employees
      })
    } else {
      response.status(404).json({
        message: 'Employee not found',
        success: false
      })
    }
  } catch (error) {
    response.status(500).json({
      message:
        error instanceof Error ? error.message : 'Failed to update employee',
      success: false
    })
  }
}
