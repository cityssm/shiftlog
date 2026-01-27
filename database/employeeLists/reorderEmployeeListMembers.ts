import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface ReorderEmployeeListMembersForm {
  employeeListId: number
  employeeNumbers: string[]
  seniorityDate: string | undefined
}

export default async function reorderEmployeeListMembers(
  form: ReorderEmployeeListMembersForm
): Promise<boolean> {
  try {
    const pool = await mssqlPool.connect(
      getConfigProperty('connectors.shiftLog')
    )

    const transaction = pool.transaction()
    await transaction.begin()

    try {
      for (const [index, employeeNumber] of form.employeeNumbers.entries()) {
        // eslint-disable-next-line no-await-in-loop
        await transaction
          .request()
          .input('instance', getConfigProperty('application.instance'))
          .input('employeeListId', form.employeeListId)
          .input('employeeNumber', employeeNumber)
          .input('seniorityDate', form.seniorityDate ?? null)
          .input('seniorityOrderNumber', index)
          .query(/* sql */ `
            UPDATE ShiftLog.EmployeeListMembers
            SET
              seniorityOrderNumber = @seniorityOrderNumber
            WHERE
              instance = @instance
              AND employeeListId = @employeeListId
              AND employeeNumber = @employeeNumber ${form.seniorityDate ===
              undefined
                ? ''
                : /* sql */ 'AND seniorityDate = @seniorityDate'}
          `)
      }

      await transaction.commit()
      return true
    } catch {
      await transaction.rollback()
      return false
    }
  } catch {
    return false
  }
}
