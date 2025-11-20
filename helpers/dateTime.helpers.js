export function dateTimeInputToSqlDateTime(dateTimeInput) {
    return dateTimeInput.replace('T', ' ');
}
