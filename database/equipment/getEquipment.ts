import type { Equipment } from '../../types/record.types.js'

import getEquipmentList from './getEquipmentList.js'

export default async function getEquipment(
  equipmentNumber: string,
  includeDeleted = false
): Promise<Equipment | undefined> {
  const equipmentList = await getEquipmentList({
    equipmentNumber,
    includeDeleted
  })
  return equipmentList.length > 0 ? equipmentList[0] : undefined
}
