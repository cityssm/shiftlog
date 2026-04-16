(() => {
    const shiftLog = exports.shiftLog;
    const workOrderTabsContainerElement = document.querySelector('#container--workOrderTabs');
    if (workOrderTabsContainerElement !== null) {
        shiftLog.initializeRecordTabs(workOrderTabsContainerElement);
        const editButtonLink = document.querySelector('a.button[href$="/edit"]');
        if (editButtonLink !== null) {
            const menuTabLinks = workOrderTabsContainerElement.querySelectorAll('.menu a');
            const activeTabLink = workOrderTabsContainerElement.querySelector('.menu a.is-active');
            if (activeTabLink !== null) {
                const tabHash = activeTabLink.getAttribute('href') ?? '';
                const baseHref = editButtonLink.href.split('#')[0];
                editButtonLink.href = baseHref + tabHash;
            }
            for (const menuTabLink of menuTabLinks) {
                menuTabLink.addEventListener('click', (clickEvent) => {
                    const target = clickEvent.currentTarget;
                    const tabHash = target.getAttribute('href') ?? '';
                    const baseHref = editButtonLink.href.split('#')[0];
                    editButtonLink.href = baseHref + tabHash;
                });
            }
        }
    }
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
                        }, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
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
