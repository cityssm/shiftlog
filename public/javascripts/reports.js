(() => {
    const reportsContainerElement = document.querySelector('#container--reportTabs');
    if (reportsContainerElement !== null) {
        exports.shiftLog.initializeRecordTabs(reportsContainerElement);
    }
    let initialTabElement = null;
    if (exports.activeTab !== '') {
        initialTabElement = reportsContainerElement?.querySelector(`.menu-list a[href="#tab--${CSS.escape(exports.activeTab)}"]`);
    }
    initialTabElement ??= reportsContainerElement?.querySelector('.menu-list a');
    initialTabElement?.click();
})();
