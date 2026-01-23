"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    /*
     * Filter Settings
     */
    var settingsFilterElement = document.querySelector('#settingsFilter');
    var settingsTableBodyElement = document.querySelector('#settingsTableBody');
    function applySettingsFilter() {
        var _a;
        var filterValue = settingsFilterElement.value.toLowerCase();
        for (var _i = 0, _b = settingsTableBodyElement.querySelectorAll('tr'); _i < _b.length; _i++) {
            var rowElement = _b[_i];
            var searchString = (_a = rowElement.dataset.searchString) !== null && _a !== void 0 ? _a : '';
            rowElement.classList.toggle('is-hidden', !searchString.includes(filterValue));
        }
    }
    settingsFilterElement.addEventListener('input', applySettingsFilter);
    applySettingsFilter();
    /*
     * Update Settings
     */
    function highlightChangedSettings(changeEvent) {
        var inputElement = changeEvent.currentTarget;
        inputElement.classList.add('has-background-warning-light');
    }
    function updateSetting(formEvent) {
        formEvent.preventDefault();
        var formElement = formEvent.currentTarget;
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateSetting"), formElement, function (responseJSON) {
            var _a, _b;
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'Setting Updated',
                    message: 'The setting has been successfully updated.'
                });
                (_a = formElement
                    .querySelector('.input, select')) === null || _a === void 0 ? void 0 : _a.classList.remove('has-background-warning-light');
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Update Failed',
                    message: (_b = responseJSON.errorMessage) !== null && _b !== void 0 ? _b : 'There was an error updating the setting.'
                });
            }
        });
    }
    var settingFormElements = document.querySelectorAll('.settingForm');
    for (var _i = 0, settingFormElements_1 = settingFormElements; _i < settingFormElements_1.length; _i++) {
        var settingFormElement = settingFormElements_1[_i];
        settingFormElement.addEventListener('submit', updateSetting);
        (_a = settingFormElement
            .querySelector('.input, select')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', highlightChangedSettings);
    }
})();
//# sourceMappingURL=settings.admin.js.map