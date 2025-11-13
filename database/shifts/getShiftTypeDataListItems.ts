import type { DataListItem } from '../../types/record.types.js'
import getDataListItems from '../app/getDataListItems.js'

export default async function getShiftTypeDataListItems(
  userName: string
): Promise<DataListItem[]> {
  return await getDataListItems('shiftTypes', userName)
}
