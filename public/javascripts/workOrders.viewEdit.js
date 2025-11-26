;(() => {
    const workOrderTabsContainerElement = document.querySelector('#container--workOrderTabs');
    if (workOrderTabsContainerElement !== null) {
        exports.shiftLog.initializeRecordTabs(workOrderTabsContainerElement);
    }
})();
