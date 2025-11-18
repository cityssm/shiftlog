import type { DataListItem } from '../../types/record.types.js'
import getDataListItems from '../app/getDataListItems.js'

export default async function getTimesheetTypeDataListItems(
  user?: User
): Promise<DataListItem[]> {
  return await getDataListItems('timesheetTypes', user)
}
