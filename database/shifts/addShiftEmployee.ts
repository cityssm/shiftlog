import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'


interface AddShiftEmployeeForm {
  shiftId: number | string
  employeeNumber: string
  crewId?: number | string | null
  shiftEmployeeNote?: string
}

export default async function addShiftEmployee(
  form: AddShiftEmployeeForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('employeeNumber', form.employeeNumber)
      .input('crewId', (form.crewId ?? '') === '' ? null : form.crewId)
      .input('shiftEmployeeNote', form.shiftEmployeeNote ?? '').query(/* sql */ `
        insert into ShiftLog.ShiftEmployees (shiftId, employeeNumber, crewId, shiftEmployeeNote)
        values (@shiftId, @employeeNumber, @crewId, @shiftEmployeeNote)
      `)

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
