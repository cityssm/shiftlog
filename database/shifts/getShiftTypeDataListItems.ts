import type { DataListItem } from '../../types/record.types.js'
import getDataListItems from '../app/getDataListItems.js'

export default async function getShiftTypeDataListItems(
  user?: User
): Promise<DataListItem[]> {
  return await getDataListItems('shiftTypes', user)
}
