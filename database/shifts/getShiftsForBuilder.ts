import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Shift } from '../../types/record.types.js'

export interface ShiftForBuilder extends Shift {
  crews: Array<{
    crewId: number
    crewName: string
    shiftCrewNote: string
  }>
  employees: Array<{
    employeeNumber: string
    firstName: string
    lastName: string

    crewId: number | null
    crewName: string | null

    isSupervisor: boolean
    shiftEmployeeNote: string
  }>
  equipment: Array<{
    equipmentNumber: string

    equipmentName: string

    employeeNumber: string | null
    employeeFirstName: string | null
    employeeLastName: string | null

    shiftEquipmentNote: string
  }>
  workOrders: Array<{
    workOrderId: number
    workOrderNumber: string

    workOrderDetails: string

    shiftWorkOrderNote: string
  }>
  adhocTasks: Array<{
    adhocTaskId: number
    adhocTaskTypeDataListItemId: number
    adhocTaskTypeDataListItem: string

    taskDescription: string

    locationAddress1: string
    locationAddress2: string
    locationCityProvince: string

    taskDueDateTime: Date | string | null

    shiftAdhocTaskNote: string
  }>
}

export default async function getShiftsForBuilder(
  shiftDateString: DateString,
  user?: User
): Promise<ShiftForBuilder[]> {
  const pool = await getShiftLogConnectionPool()

  let whereClause = /* sql */ `
    WHERE
      s.instance = @instance
      AND s.recordDelete_dateTime IS NULL
      AND s.shiftDate = @shiftDateString
  `

  if (user !== undefined) {
    whereClause += /* sql */ `
      AND (
        sType.userGroupId IS NULL
        OR sType.userGroupId IN (
          SELECT
            userGroupId
          FROM
            ShiftLog.UserGroupMembers
          WHERE
            userName = @userName
        )
      )
    `
  }

  const sql = /* sql */ `
    SELECT
      s.shiftId,
      s.shiftDate,
      s.shiftTimeDataListItemId,
      sTime.dataListItem AS shiftTimeDataListItem,
      s.shiftTypeDataListItemId,
      sType.dataListItem AS shiftTypeDataListItem,
      s.supervisorEmployeeNumber,
      sup.firstName AS supervisorFirstName,
      sup.lastName AS supervisorLastName,
      sup.userName AS supervisorUserName,
      s.shiftDescription,
      s.recordCreate_userName,
      s.recordCreate_dateTime,
      s.recordUpdate_userName,
      s.recordUpdate_dateTime,
      s.recordLock_dateTime
    FROM
      ShiftLog.Shifts s
      LEFT JOIN ShiftLog.DataListItems sTime ON s.shiftTimeDataListItemId = sTime.dataListItemId
      LEFT JOIN ShiftLog.DataListItems sType ON s.shiftTypeDataListItemId = sType.dataListItemId
      LEFT JOIN ShiftLog.Employees sup ON s.supervisorEmployeeNumber = sup.employeeNumber
      AND s.instance = sup.instance ${whereClause}
    ORDER BY
      s.shiftTimeDataListItemId,
      s.shiftTypeDataListItemId
  `

  const shiftsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('shiftDateString', shiftDateString)
    .input('userName', user?.userName)
    .query(sql)

  const shifts = shiftsResult.recordset as ShiftForBuilder[]

  // Get crews, employees, equipment, and work orders for all shifts
  const shiftIds = shifts.map((shift) => shift.shiftId)

  if (shiftIds.length === 0) {
    return []
  }

  // Get crews
  const crewsSql = /* sql */ `
    SELECT
      sc.shiftId,
      sc.crewId,
      c.crewName,
      sc.shiftCrewNote
    FROM
      ShiftLog.ShiftCrews sc
      INNER JOIN ShiftLog.Crews c ON sc.crewId = c.crewId
    WHERE
      sc.shiftId IN (${shiftIds.join(',')})
      AND c.recordDelete_dateTime IS NULL
    ORDER BY
      c.crewName
  `

  const crewsResult = await pool.request().query<{
    shiftId: number
    crewId: number
    crewName: string
    shiftCrewNote: string
  }>(crewsSql)

  // Get employees
  const employeesSql = /* sql */ `
    SELECT
      se.shiftId,
      se.employeeNumber,
      e.firstName,
      e.lastName,
      se.crewId,
      c.crewName,
      se.shiftEmployeeNote,
      e.isSupervisor
    FROM
      ShiftLog.ShiftEmployees se
      INNER JOIN ShiftLog.Employees e ON se.employeeNumber = e.employeeNumber
      AND se.instance = e.instance
      LEFT JOIN ShiftLog.Crews c ON se.crewId = c.crewId
    WHERE
      se.shiftId IN (${shiftIds.join(',')})
      AND e.recordDelete_dateTime IS NULL
    ORDER BY
      e.lastName,
      e.firstName
  `

  const employeesResult = await pool.request().query<{
    shiftId: number
    employeeNumber: string
    firstName: string
    lastName: string

    crewId: number | null
    crewName: string | null
    shiftEmployeeNote: string
    isSupervisor: boolean
  }>(employeesSql)

  // Get equipment
  const equipmentSql = /* sql */ `
    SELECT
      seq.shiftId,
      seq.equipmentNumber,
      eq.equipmentName,
      seq.employeeNumber,
      e.firstName AS employeeFirstName,
      e.lastName AS employeeLastName,
      seq.shiftEquipmentNote
    FROM
      ShiftLog.ShiftEquipment seq
      INNER JOIN ShiftLog.Equipment eq ON seq.equipmentNumber = eq.equipmentNumber
      AND seq.instance = eq.instance
      LEFT JOIN ShiftLog.Employees e ON seq.employeeNumber = e.employeeNumber
      AND seq.instance = e.instance
    WHERE
      seq.shiftId IN (${shiftIds.join(',')})
      AND eq.recordDelete_dateTime IS NULL
    ORDER BY
      eq.equipmentName
  `

  const equipmentResult = await pool.request().query<{
    shiftId: number
    equipmentNumber: string
    equipmentName: string
    employeeNumber: string | null
    employeeFirstName: string | null
    employeeLastName: string | null
    shiftEquipmentNote: string
  }>(equipmentSql)

  // Get work orders
  const workOrdersSql = /* sql */ `
    SELECT
      sw.shiftId,
      sw.workOrderId,
      wo.workOrderNumber,
      wo.workOrderDetails,
      sw.shiftWorkOrderNote
    FROM
      ShiftLog.ShiftWorkOrders sw
      INNER JOIN ShiftLog.WorkOrders wo ON sw.workOrderId = wo.workOrderId
    WHERE
      sw.shiftId IN (${shiftIds.join(',')})
      AND wo.recordDelete_dateTime IS NULL
    ORDER BY
      wo.workOrderNumber
  `

  const workOrdersResult = await pool.request().query<{
    shiftId: number
    workOrderId: number
    workOrderNumber: string
    workOrderDetails: string
    shiftWorkOrderNote: string
  }>(workOrdersSql)

  // Get adhoc tasks
  const adhocTasksSql = /* sql */ `
    SELECT
      st.shiftId,
      st.adhocTaskId,
      t.adhocTaskTypeDataListItemId,
      td.dataListItem AS adhocTaskTypeDataListItem,
      t.taskDescription,
      t.locationAddress1,
      t.locationAddress2,
      t.locationCityProvince,
      t.taskDueDateTime,
      st.shiftAdhocTaskNote
    FROM
      ShiftLog.ShiftAdhocTasks st
      INNER JOIN ShiftLog.AdhocTasks t ON st.adhocTaskId = t.adhocTaskId
      LEFT JOIN ShiftLog.DataListItems td ON t.adhocTaskTypeDataListItemId = td.dataListItemId
    WHERE
      st.shiftId IN (${shiftIds.join(',')})
      AND t.recordDelete_dateTime IS NULL
    ORDER BY
      t.taskDueDateTime,
      t.recordCreate_dateTime DESC
  `

  const adhocTasksResult = await pool.request().query<{
    shiftId: number
    adhocTaskId: number
    adhocTaskTypeDataListItemId: number
    adhocTaskTypeDataListItem: string
    taskDescription: string
    locationAddress1: string
    locationAddress2: string
    locationCityProvince: string
    taskDueDateTime: Date | string | null
    shiftAdhocTaskNote: string
  }>(adhocTasksSql)

  // Combine data
  for (const shift of shifts) {
    shift.crews = crewsResult.recordset.filter(
      (crew) => crew.shiftId === shift.shiftId
    )

    shift.employees = employeesResult.recordset.filter(
      (employee) => employee.shiftId === shift.shiftId
    )

    shift.equipment = equipmentResult.recordset.filter(
      (equipment) => equipment.shiftId === shift.shiftId
    )

    shift.workOrders = workOrdersResult.recordset.filter(
      (workOrder) => workOrder.shiftId === shift.shiftId
    )

    shift.adhocTasks = adhocTasksResult.recordset.filter(
      (adhocTask) => adhocTask.shiftId === shift.shiftId
    )
  }

  return shifts
}
