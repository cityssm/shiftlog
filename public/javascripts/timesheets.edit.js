(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = shiftLog.urlPrefix + '/' + shiftLog.timesheetsRouter;
    const formElement = document.querySelector('#form--timesheet');
    const timesheetIdElement = formElement.querySelector('#timesheet--timesheetId');
    const isCreate = timesheetIdElement.value === '' || timesheetIdElement.value === '-1';
    function doSaveTimesheet(formEvent) {
        formEvent.preventDefault();
        const endpoint = isCreate ? 'doCreateTimesheet' : 'doUpdateTimesheet';
        cityssm.postJSON(`${urlPrefix}/${endpoint}`, formElement, (rawResponseJSON) => {
            const result = rawResponseJSON;
            if (result.success) {
                if (isCreate) {
                    globalThis.location.href = `${urlPrefix}/${result.timesheetId ?? ''}/edit`;
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Timesheet updated successfully.'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'An error occurred while saving the timesheet.'
                });
            }
        });
    }
    formElement.addEventListener('submit', doSaveTimesheet);
})();
