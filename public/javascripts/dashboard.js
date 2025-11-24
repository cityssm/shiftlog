;
(() => {
    const workOrderHighlightsPanelElement = document.querySelector('#panel--workOrderHighlights');
    function toggleWorkOrderPanelTab(event) {
        event.preventDefault();
        const target = event.currentTarget;
        for (const panelTabElement of panelTabElements) {
            panelTabElement.classList.remove('is-active');
        }
        target.classList.add('is-active');
        const workOrderType = target.dataset.workOrderType;
        const panelBlockElements = (workOrderHighlightsPanelElement?.querySelectorAll('.panel-block[data-work-order-type]') ?? []);
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.classList.toggle('is-hidden', panelBlockElement.dataset.workOrderType !== workOrderType);
        }
    }
    const panelTabElements = workOrderHighlightsPanelElement?.querySelectorAll('.panel-tabs a') ?? [];
    for (const panelTabElement of panelTabElements) {
        panelTabElement.addEventListener('click', toggleWorkOrderPanelTab);
    }
})();
