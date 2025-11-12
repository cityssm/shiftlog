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
     * Declare shiftLog
     */
    exports.shiftLog = {
        ...exports.shiftLog,
        clearUnsavedChanges,
        hasUnsavedChanges,
        setUnsavedChanges
    };
})();
