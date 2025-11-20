import type { DataListItem } from '../../types/record.types.js'
import getDataListItems from '../app/getDataListItems.js'

export default async function getEquipmentTypeDataListItems(
  user?: User
): Promise<DataListItem[]> {
  return await getDataListItems('equipmentTypes', user)
}
