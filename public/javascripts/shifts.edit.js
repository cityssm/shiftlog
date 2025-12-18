(() => {
    const shiftLog = exports.shiftLog;
    const shiftUrlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`;
    const shiftFormElement = document.querySelector('#form--shift');
    const shiftId = shiftFormElement.querySelector('#shift--shiftId').value;
    const isCreate = shiftId === '';
    /*
     * Set up date picker
     */
    const shiftDateStringElement = shiftFormElement.querySelector('#shift--shiftDateString');
    if (shiftDateStringElement !== null) {
        flatpickr(shiftDateStringElement, {
            allowInput: true,
            dateFormat: 'Y-m-d',
            nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
            prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
        });
    }
    function updateShift(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${shiftUrlPrefix}/${isCreate ? 'doCreateShift' : 'doUpdateShift'}`, shiftFormElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                if (isCreate && responseJSON.shiftId !== undefined) {
                    globalThis.location.href = shiftLog.buildShiftURL(responseJSON.shiftId, true);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Updated Successfully'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Update Error',
                    message: responseJSON.errorMessage ?? 'An unknown error occurred.'
                });
            }
        });
    }
    shiftFormElement.addEventListener('submit', updateShift);
    /*
     * Delete shift
     */
    const deleteShiftButton = document.querySelector('#button--deleteShift');
    if (deleteShiftButton !== null) {
        deleteShiftButton.addEventListener('click', (event) => {
            event.preventDefault();
            bulmaJS.confirm({
                contextualColorName: 'danger',
                title: 'Delete Shift',
                message: 'Are you sure you want to delete this shift? This action cannot be undone.',
                okButton: {
                    text: 'Delete Shift',
                    callbackFunction: () => {
                        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShift`, {
                            shiftId
                        }, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
                            if (responseJSON.success &&
                                responseJSON.redirectUrl !== undefined) {
                                globalThis.location.href = responseJSON.redirectUrl;
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Delete Error',
                                    message: responseJSON.errorMessage ?? 'An unknown error occurred.'
                                });
                            }
                        });
                    }
                }
            });
        });
    }
})();
