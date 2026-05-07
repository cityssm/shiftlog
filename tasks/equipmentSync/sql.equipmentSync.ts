import mssqlMultiPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Equipment } from '../../types/record.types.js'

export default async function getEquipment(): Promise<
  Array<Partial<Equipment>> | undefined
> {
  const equipmentConfig = getConfigProperty('equipment')

  if (equipmentConfig.syncSource !== 'sql') {
    return undefined
  }

  const sqlConfig = getConfigProperty('connectors.equipmentSync')

  if (sqlConfig === undefined) {
    return undefined
  }

  const pool = await mssqlMultiPool.connect(sqlConfig)

  const sqlEquipment = await pool
    .request()
    .query<Partial<Equipment>>(equipmentConfig.sql)

  return sqlEquipment.recordset
}
