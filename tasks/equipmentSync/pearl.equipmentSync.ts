import { WorkTechAPI } from '@cityssm/worktech-api'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Equipment } from '../../types/record.types.js'

export default async function getEquipment(): Promise<
  Array<Partial<Equipment>> | undefined
> {
  const equipmentConfig = getConfigProperty('equipment')

  if (equipmentConfig.syncSource !== 'pearl') {
    return undefined
  }

  const pearlConfig = getConfigProperty('connectors.pearl')

  if (pearlConfig === undefined) {
    return undefined
  }

  const worktechApi = new WorkTechAPI(pearlConfig)

  const worktechEquipment = await worktechApi.getEquipment(
    equipmentConfig.filters ?? {}
  )

  const equipmentList: Array<Partial<Equipment>> = []

  for (const worktechEquipmentItem of worktechEquipment) {
    const equipmentItem: Partial<Equipment> = {
      equipmentNumber: worktechEquipmentItem.equipmentId,

      equipmentName: worktechEquipmentItem.equipmentDescription,

      equipmentDescription: `${worktechEquipmentItem.equipmentModelYear} ${worktechEquipmentItem.equipmentBrand} ${worktechEquipmentItem.equipmentModel}`,

      equipmentTypeDataListItem: worktechEquipmentItem.equipmentClass,

      recordSync_dateTime: new Date(),
      recordSync_isSynced: true,
      recordSync_source: 'pearl'
    }

    equipmentList.push(equipmentItem)
  }

  return equipmentList
}
