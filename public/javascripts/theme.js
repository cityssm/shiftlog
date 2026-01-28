(() => {
    function doLogout() {
        globalThis.localStorage.clear();
        globalThis.location.href = `${exports.shiftLog.urlPrefix}/logout`;
    }
    document
        .querySelector('#cityssm-theme--logout-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Log Out?',
            message: 'Are you sure you want to log out?',
            okButton: {
                callbackFunction: doLogout,
                text: 'Log Out'
            }
        });
    });
})();
(() => {
    const keepAliveMillis = exports.shiftLog.sessionKeepAliveMillis;
    let keepAliveInterval;
    function doKeepAlive() {
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/keepAlive`, {
            t: Date.now()
        }, (responseJSON) => {
            if (!responseJSON.activeSession) {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Session Expired',
                    message: 'Your session has expired. Please log in again.',
                    okButton: {
                        callbackFunction: () => {
                            globalThis.location.reload();
                        },
                        text: 'Refresh Page'
                    }
                });
                globalThis.clearInterval(keepAliveInterval);
            }
        });
    }
    if (keepAliveMillis !== 0) {
        keepAliveInterval = globalThis.setInterval(doKeepAlive, keepAliveMillis);
    }
})();
