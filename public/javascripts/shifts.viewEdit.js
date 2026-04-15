(() => {
    const shiftLog = exports.shiftLog;
    const shiftTabsContainerElement = document.querySelector('#container--shiftTabs');
    if (shiftTabsContainerElement !== null) {
        shiftLog.initializeRecordTabs(shiftTabsContainerElement);
        const editButtonLink = document.querySelector('a.button[href$="/edit"]');
        if (editButtonLink !== null) {
            const menuTabLinks = shiftTabsContainerElement.querySelectorAll('.menu a');
            const activeTabLink = shiftTabsContainerElement.querySelector('.menu a.is-active');
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
})();
