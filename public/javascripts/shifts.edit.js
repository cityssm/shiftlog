(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`;
    const shiftFormElement = document.querySelector('#form--shift');
    const shiftId = shiftFormElement.querySelector('#shift--shiftId').value;
    const isCreate = shiftId === '';
    function updateShift(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${urlPrefix}/${isCreate ? 'doCreateShift' : 'doUpdateShift'}`, shiftFormElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                if (isCreate && responseJSON.shiftId !== undefined) {
                    globalThis.location.href = `${urlPrefix}/${responseJSON.shiftId.toString()}`;
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
})();
