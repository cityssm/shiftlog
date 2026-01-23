(() => {
    const shiftTabsContainerElement = document.querySelector('#container--shiftTabs');
    if (shiftTabsContainerElement !== null) {
        exports.shiftLog.initializeRecordTabs(shiftTabsContainerElement);
    }
})();
export {};
