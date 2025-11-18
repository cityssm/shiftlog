// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
(() => {
    const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? '';
    const timesheetRouter = document.querySelector('main')?.dataset.timesheetRouter ?? '';
    const formElement = document.querySelector('#form--timesheet');
    const timesheetIdElement = formElement.querySelector('#timesheet--timesheetId');
    const isCreate = timesheetIdElement.value === '' || timesheetIdElement.value === '-1';
    function doSaveTimesheet(formEvent) {
        formEvent.preventDefault();
        const endpoint = isCreate ? 'doCreateTimesheet' : 'doUpdateTimesheet';
        cityssm.postJSON(`${urlPrefix}/${timesheetRouter}/${endpoint}`, formElement, (rawResponseJSON) => {
            const result = rawResponseJSON;
            if (result.success) {
                if (isCreate && result.redirectURL) {
                    window.location.href = result.redirectURL;
                }
                else {
                    cityssm.alertModal('Success', 'Timesheet updated successfully.', 'success', () => {
                        window.location.reload();
                    });
                }
            }
            else {
                cityssm.alertModal('Error', 'An error occurred while saving the timesheet.', 'error');
            }
        });
    }
    formElement.addEventListener('submit', doSaveTimesheet);
})();
