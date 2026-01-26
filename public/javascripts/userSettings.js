(() => {
    const shiftLog = exports.shiftLog;
    /*
     * Employee Contact Information
     */
    const employeeContactForm = document.querySelector('#employeeContactForm');
    if (employeeContactForm !== null) {
        employeeContactForm.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault();
            const formElement = formEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/dashboard/doUpdateEmployeeContact`, formElement, (responseJSON) => {
                if (responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Contact Information Updated',
                        message: 'Your contact information has been updated successfully.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'There was an error updating your contact information.'
                    });
                }
            });
        });
    }
    /*
     * User Settings
     */
    const userSettingForms = document.querySelectorAll('.userSettingForm');
    for (const userSettingForm of userSettingForms) {
        userSettingForm.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault();
            const formElement = formEvent.currentTarget;
            const formData = new FormData(formElement);
            const settingKey = formData.get('settingKey');
            const settingValue = formData.get('settingValue');
            cityssm.postJSON(`${shiftLog.urlPrefix}/dashboard/doUpdateUserSetting`, {
                settingKey,
                settingValue
            }, (responseJSON) => {
                if (responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'User Setting Updated',
                        message: 'Your user setting has been updated successfully.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'There was an error updating your user setting.'
                    });
                }
            });
        });
    }
    /*
     * API Key
     */
    function doResetApiKey() {
        cityssm.postJSON(`${shiftLog.urlPrefix}/dashboard/doResetApiKey`, {}, (responseJSON) => {
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'API Key Reset Successfully',
                    message: 'Remember to update any applications using your API key.'
                });
            }
        });
    }
    document
        .querySelector('#button--resetApiKey')
        ?.addEventListener('click', (event) => {
        event.preventDefault();
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Reset API Key',
            message: 'Are you sure you want to reset your API key?',
            okButton: {
                callbackFunction: doResetApiKey,
                text: 'Yes, Reset My API Key'
            }
        });
    });
})();
