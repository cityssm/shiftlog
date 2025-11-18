(() => {
    /*
     * Unsaved Changes
     */
    let _hasUnsavedChanges = false;
    function setUnsavedChanges() {
        if (!hasUnsavedChanges()) {
            _hasUnsavedChanges = true;
            cityssm.enableNavBlocker();
        }
    }
    function clearUnsavedChanges() {
        _hasUnsavedChanges = false;
        cityssm.disableNavBlocker();
    }
    function hasUnsavedChanges() {
        return _hasUnsavedChanges;
    }
    /*
     * URL builders
     */
    function buildShiftURL(shiftId) {
        return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.shiftsRouter}/${shiftId.toString()}`;
    }
    function buildTimesheetURL(timesheetId) {
        return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.timesheetsRouter}/${timesheetId.toString()}`;
    }
    /*
     * Declare shiftLog
     */
    exports.shiftLog = {
        ...exports.shiftLog,
        clearUnsavedChanges,
        hasUnsavedChanges,
        setUnsavedChanges,
        buildShiftURL,
        buildTimesheetURL
    };
})();
