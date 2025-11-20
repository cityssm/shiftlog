import type { DateString, TimeString } from '@cityssm/utils-datetime'

export function dateTimeInputToSqlDateTime(
  dateTimeInput: string
): `${DateString} ${TimeString}` {
  return dateTimeInput.replace('T', ' ') as `${DateString} ${TimeString}`
}
