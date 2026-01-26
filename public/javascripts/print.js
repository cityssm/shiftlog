;
(() => {
    function removeReportBlock(event) {
        const buttonElement = event.currentTarget;
        const reportBlockElement = buttonElement.closest('.report-block');
        reportBlockElement.remove();
    }
    const deleteReportBlockButtonElements = document.querySelectorAll('.is-delete-report-block-button');
    for (const buttonElement of deleteReportBlockButtonElements) {
        buttonElement.addEventListener('click', removeReportBlock);
    }
})();
