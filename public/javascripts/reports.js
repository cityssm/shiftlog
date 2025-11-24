(() => {
    const reportsContainerElement = document.querySelector('#container--reportTabs');
    if (reportsContainerElement !== null) {
        exports.shiftLog.initializeRecordTabs(reportsContainerElement);
    }
    ;
    reportsContainerElement?.querySelector('.menu-list a')?.click();
})();
