;
(() => {
    /*
     * Make form read only
     */
    const formElement = document.querySelector('#form--timesheet');
    formElement?.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    const formElements = formElement?.querySelectorAll('input, select, textarea');
    for (const formElement of formElements) {
        formElement.disabled = true;
        if (formElement.tagName.toLowerCase() !== 'select') {
            ;
            formElement.readOnly = true;
        }
    }
})();
