(() => {
    const shiftLog = exports.shiftLog;
    const workOrderTabsContainerElement = document.querySelector('#container--workOrderTabs');
    if (workOrderTabsContainerElement !== null) {
        shiftLog.initializeRecordTabs(workOrderTabsContainerElement);
    }
    /*
     * Reopen work order
     */
    const reopenWorkOrderButton = document.querySelector('#button--reopenWorkOrder');
    if (reopenWorkOrderButton !== null) {
        reopenWorkOrderButton.addEventListener('click', () => {
            bulmaJS.confirm({
                contextualColorName: 'warning',
                message: 'Are you sure you want to reopen this work order? This will clear the close date.',
                okButton: {
                    callbackFunction: () => {
                        const workOrderIdElement = document.querySelector('#workOrder--workOrderId');
                        cityssm.postJSON(`${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doReopenWorkOrder`, {
                            workOrderId: workOrderIdElement.value
                        }, (responseJSON) => {
                            if (responseJSON.success) {
                                globalThis.location.href = responseJSON.redirectUrl;
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Reopen Error',
                                    message: responseJSON.errorMessage
                                });
                            }
                        });
                    },
                    text: 'Reopen Work Order'
                },
                title: 'Reopen Work Order'
            });
        });
    }
})();
