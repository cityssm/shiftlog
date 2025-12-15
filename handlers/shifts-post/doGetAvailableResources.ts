import type { Request, Response } from 'express'
import type { DateString } from '@cityssm/utils-datetime'

import getEmployees from '../../database/employees/getEmployees.js'
import getEquipment from '../../database/equipment/getEquipment.js'
import getCrews from '../../database/crews/getCrews.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface DoGetAvailableResourcesResponse {
  success: boolean
  employees: Array<{
    employeeNumber: string
    firstName: string
    lastName: string
  }>
  equipment: Array<{
    equipmentNumber: string
    equipmentName: string
  }>
  crews: Array<{
    crewId: number
    crewName: string
  }>
}

export default async function handler(
  request: Request<unknown, unknown, { shiftDateString: DateString }>,
  response: Response<DoGetAvailableResourcesResponse>
): Promise<void> {
  const { shiftDateString } = request.body

  const pool = await getShiftLogConnectionPool()
  const instance = getConfigProperty('application.instance')

  // Get all employees not on any shift for this date
  const employeesResult = await pool.request()
    .input('instance', instance)
    .input('shiftDateString', shiftDateString).query(`
      select e.employeeNumber, e.firstName, e.lastName
      from ShiftLog.Employees e
      where e.instance = @instance
        and e.recordDelete_dateTime is null
        and e.isActive = 1
        and e.employeeNumber not in (
          select se.employeeNumber
          from ShiftLog.ShiftEmployees se
          inner join ShiftLog.Shifts s on se.shiftId = s.shiftId
          where s.instance = @instance
            and s.recordDelete_dateTime is null
            and s.shiftDate = @shiftDateString
            and se.recordDelete_dateTime is null
        )
      order by e.lastName, e.firstName
    `)

  // Get all equipment not on any shift for this date
  const equipmentResult = await pool.request()
    .input('instance', instance)
    .input('shiftDateString', shiftDateString).query(`
      select eq.equipmentNumber, eq.equipmentName
      from ShiftLog.Equipment eq
      where eq.instance = @instance
        and eq.recordDelete_dateTime is null
        and eq.isActive = 1
        and eq.equipmentNumber not in (
          select seq.equipmentNumber
          from ShiftLog.ShiftEquipment seq
          inner join ShiftLog.Shifts s on seq.shiftId = s.shiftId
          where s.instance = @instance
            and s.recordDelete_dateTime is null
            and s.shiftDate = @shiftDateString
            and seq.recordDelete_dateTime is null
        )
      order by eq.equipmentName
    `)

  // Get all crews not on any shift for this date
  const crewsResult = await pool.request()
    .input('instance', instance)
    .input('shiftDateString', shiftDateString).query(`
      select c.crewId, c.crewName
      from ShiftLog.Crews c
      where c.instance = @instance
        and c.recordDelete_dateTime is null
        and c.isActive = 1
        and c.crewId not in (
          select sc.crewId
          from ShiftLog.ShiftCrews sc
          inner join ShiftLog.Shifts s on sc.shiftId = s.shiftId
          where s.instance = @instance
            and s.recordDelete_dateTime is null
            and s.shiftDate = @shiftDateString
            and sc.recordDelete_dateTime is null
        )
      order by c.crewName
    `)

  response.json({
    success: true,
    employees: employeesResult.recordset,
    equipment: equipmentResult.recordset,
    crews: crewsResult.recordset
  })
}
