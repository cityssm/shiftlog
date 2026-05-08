import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface DeleteWorkOrderEquipmentForm {
  equipmentNumber: string
  workOrderId: number | string
}

export default async function deleteWorkOrderEquipment(
  form: DeleteWorkOrderEquipmentForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    const result = await pool
      .request()
      .input('equipmentNumber', form.equipmentNumber)
      .input('instance', getConfigProperty('application.instance'))
      .input('workOrderId', form.workOrderId)
      // eslint-disable-next-line no-secrets/no-secrets
      .query(/* sql */ `
        DELETE woe
        FROM
          ShiftLog.WorkOrderEquipment woe
          INNER JOIN ShiftLog.WorkOrders wo ON woe.workOrderId = wo.workOrderId
        WHERE
          woe.workOrderId = @workOrderId
          AND woe.equipmentNumber = @equipmentNumber
          AND wo.instance = @instance
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
