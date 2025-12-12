import type { DataListItem } from '../../types/record.types.js'
import getDataListItems from '../app/getDataListItems.js'

export default async function getWorkOrderStatusDataListItems(
  user?: string | User
): Promise<DataListItem[]> {
  const userName = typeof user === 'string' ? user : user?.userName
  return await getDataListItems('workOrderStatuses', userName)
}
