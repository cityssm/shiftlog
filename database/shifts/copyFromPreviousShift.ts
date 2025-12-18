import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

interface CopyFromPreviousShiftForm {
  currentShiftId: number | string
  previousShiftId: number | string
  copyCrews?: boolean
  copyEmployees?: boolean
  copyEquipment?: boolean
}

export default async function copyFromPreviousShift(
  form: CopyFromPreviousShiftForm,
  user: User
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    // Copy crews
    if (form.copyCrews) {
      await pool
        .request()
        .input('currentShiftId', form.currentShiftId)
        .input('previousShiftId', form.previousShiftId)
        .input('userName', user.userName).query(/* sql */ `
          insert into ShiftLog.ShiftCrews (shiftId, crewId, shiftCrewNote)
          select @currentShiftId, sc.crewId, sc.shiftCrewNote
          from ShiftLog.ShiftCrews sc
          inner join ShiftLog.Crews c on sc.crewId = c.crewId
          where sc.shiftId = @previousShiftId
            and c.recordDelete_dateTime is null
            and (
              c.userGroupId is null or c.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
            and not exists (
              select 1 from ShiftLog.ShiftCrews sc2
              where sc2.shiftId = @currentShiftId and sc2.crewId = sc.crewId
            )
        `)
    }

    // Copy employees
    if (form.copyEmployees) {
      await pool
        .request()
        .input('currentShiftId', form.currentShiftId)
        .input('previousShiftId', form.previousShiftId)
        .input('userName', user.userName).query(/* sql */ `
          insert into ShiftLog.ShiftEmployees (shiftId, instance, employeeNumber, crewId, shiftEmployeeNote)
          select @currentShiftId, se.instance, se.employeeNumber, se.crewId, se.shiftEmployeeNote
          from ShiftLog.ShiftEmployees se
          inner join ShiftLog.Employees e on se.instance = e.instance and se.employeeNumber = e.employeeNumber
          where se.shiftId = @previousShiftId
            and e.recordDelete_dateTime is null
            and (
              e.userGroupId is null or e.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
            and not exists (
              select 1 from ShiftLog.ShiftEmployees se2
              where se2.shiftId = @currentShiftId and se2.employeeNumber = se.employeeNumber
            )
        `)
    }

    // Copy equipment
    if (form.copyEquipment) {
      await pool
        .request()
        .input('currentShiftId', form.currentShiftId)
        .input('previousShiftId', form.previousShiftId)
        .input('userName', user.userName).query(/* sql */ `
          insert into ShiftLog.ShiftEquipment (shiftId, instance, equipmentNumber, employeeNumber, shiftEquipmentNote)
          select @currentShiftId, se.instance, se.equipmentNumber, se.employeeNumber, se.shiftEquipmentNote
          from ShiftLog.ShiftEquipment se
          inner join ShiftLog.Equipment eq on se.instance = eq.instance and se.equipmentNumber = eq.equipmentNumber
          where se.shiftId = @previousShiftId
            and eq.recordDelete_dateTime is null
            and (
              eq.userGroupId is null or eq.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
            and not exists (
              select 1 from ShiftLog.ShiftEquipment se2
              where se2.shiftId = @currentShiftId and se2.equipmentNumber = se.equipmentNumber
            )
            and (
              -- Validate employee is allowed for equipment with employee list
              se.employeeNumber is null
              or eq.employeeListId is null
              or exists (
                select 1 from ShiftLog.EmployeeListMembers elm
                where elm.employeeListId = eq.employeeListId
                  and elm.employeeNumber = se.employeeNumber
              )
            )
        `)
    }

    return true
  } catch {
    return false
  }
}
