(() => {
    const reportsContainerElement = document.querySelector('#container--reportTabs');
    if (reportsContainerElement !== null) {
        exports.shiftLog.initializeRecordTabs(reportsContainerElement);
    }
    // eslint-disable-next-line unicorn/no-null
    let initialTabElement = null;
    if (exports.activeTab !== '') {
        initialTabElement = reportsContainerElement?.querySelector(`.menu-list a[href="#tab--${exports.activeTab}"]`);
    }
    initialTabElement ??= reportsContainerElement?.querySelector('.menu-list a');
    initialTabElement?.click();
})();
