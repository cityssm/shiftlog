import type { AssignedTo } from '../../types/record.types.js'
import getAssignedToList from '../assignedTo/getAssignedToList.js'

export default async function getAssignedToDataListItems(
  user?: string | User
): Promise<AssignedTo[]> {
  const userName = typeof user === 'string' ? user : user?.userName
  return await getAssignedToList(userName)
}
