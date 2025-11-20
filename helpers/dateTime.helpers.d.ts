import type { DateString, TimeString } from '@cityssm/utils-datetime';
export declare function dateTimeInputToSqlDateTime(dateTimeInput: string): `${DateString} ${TimeString}`;
