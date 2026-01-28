"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    /*
     * Employee Contact Information
     */
    var employeeContactForm = document.querySelector('#employeeContactForm');
    if (employeeContactForm !== null) {
        employeeContactForm.addEventListener('submit', function (formEvent) {
            formEvent.preventDefault();
            var formElement = formEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/dashboard/doUpdateEmployeeContact"), formElement, function (responseJSON) {
                if (responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Contact Information Updated',
                        message: 'Your contact information has been updated successfully.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'There was an error updating your contact information.'
                    });
                }
            });
        });
    }
    /*
     * User Settings
     */
    var userSettingForms = document.querySelectorAll('.userSettingForm');
    for (var _i = 0, userSettingForms_1 = userSettingForms; _i < userSettingForms_1.length; _i++) {
        var userSettingForm = userSettingForms_1[_i];
        userSettingForm.addEventListener('submit', function (formEvent) {
            formEvent.preventDefault();
            var formElement = formEvent.currentTarget;
            var formData = new FormData(formElement);
            var settingKey = formData.get('settingKey');
            var settingValue = formData.get('settingValue');
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/dashboard/doUpdateUserSetting"), {
                settingKey: settingKey,
                settingValue: settingValue
            }, function (responseJSON) {
                if (responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'User Setting Updated',
                        message: 'Your user setting has been updated successfully.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error',
                        message: 'There was an error updating your user setting.'
                    });
                }
            });
        });
    }
    /*
     * API Key
     */
    function doResetApiKey() {
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/dashboard/doResetApiKey"), {}, function (responseJSON) {
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'API Key Reset Successfully',
                    message: 'Remember to update any applications using your API key.'
                });
            }
        });
    }
    (_a = document
        .querySelector('#button--resetApiKey')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
        event.preventDefault();
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Reset API Key',
            message: 'Are you sure you want to reset your API key?',
            okButton: {
                callbackFunction: doResetApiKey,
                text: 'Yes, Reset My API Key'
            }
        });
    });
})();
