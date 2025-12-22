import type { DataListItem } from '../../types/record.types.js';
import type { SessionUser } from '../../types/user.types.js';
export default function getAdhocTaskTypeDataListItems(sessionUser?: SessionUser): Promise<DataListItem[]>;
