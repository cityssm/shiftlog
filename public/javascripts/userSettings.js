(() => {
    const shiftLog = exports.shiftLog;
    /*
     * API Key
     */
    function doResetApiKey() {
        cityssm.postJSON(`${shiftLog.urlPrefix}/dashboard/doResetApiKey`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
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
