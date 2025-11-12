(() => {
    const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? '';
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
     * Declare sunrise
     */
    const shiftLog = {
        apiKey: document.querySelector('main')?.dataset.apiKey ?? '',
        urlPrefix,
        clearUnsavedChanges,
        hasUnsavedChanges,
        setUnsavedChanges
    };
    exports.shiftLog = shiftLog;
})();
