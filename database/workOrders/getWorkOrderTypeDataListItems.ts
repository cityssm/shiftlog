import type { DataListItem } from '../../types/record.types.js'
import getDataListItems from '../app/getDataListItems.js'

export default async function getWorkOrderTypeDataListItems(
  user?: User
): Promise<DataListItem[]> {
  return await getDataListItems('workOrderTypes', user)
}
