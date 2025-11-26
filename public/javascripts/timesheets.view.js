;
(() => {
    /*
     * Make form read only
     */
    const formElement = document.querySelector('#form--timesheet');
    formElement?.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    const inputElements = formElement?.querySelectorAll('input, select, textarea');
    for (const inputElement of inputElements) {
        inputElement.disabled = true;
        if (inputElement.tagName.toLowerCase() !== 'select') {
            ;
            inputElement.readOnly = true;
        }
    }
})();
