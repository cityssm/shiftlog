"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var workOrderTabsContainerElement = document.querySelector('#container--workOrderTabs');
    if (workOrderTabsContainerElement !== null) {
        shiftLog.initializeRecordTabs(workOrderTabsContainerElement);
        // Update Edit button href to preserve the selected tab
        var editButtonLink_1 = document.querySelector('a.button[href$="/edit"]');
        if (editButtonLink_1 !== null) {
            var menuTabLinks = workOrderTabsContainerElement.querySelectorAll('.menu a');
            // Set initial hash on Edit button based on currently active tab
            var activeTabLink = workOrderTabsContainerElement.querySelector('.menu a.is-active');
            if (activeTabLink !== null) {
                var tabHash = (_a = activeTabLink.getAttribute('href')) !== null && _a !== void 0 ? _a : '';
                var baseHref = editButtonLink_1.href.split('#')[0];
                editButtonLink_1.href = baseHref + tabHash;
            }
            // Update Edit button href when tabs are clicked
            var _loop_1 = function (menuTabLink) {
                menuTabLink.addEventListener('click', function (clickEvent) {
                    var _a;
                    var target = clickEvent.currentTarget;
                    var tabHash = (_a = target.getAttribute('href')) !== null && _a !== void 0 ? _a : '';
                    // Update the Edit button href to include the selected tab hash
                    var baseHref = editButtonLink_1.href.split('#')[0];
                    editButtonLink_1.href = baseHref + tabHash;
                });
            };
            for (var _i = 0, menuTabLinks_1 = menuTabLinks; _i < menuTabLinks_1.length; _i++) {
                var menuTabLink = menuTabLinks_1[_i];
                _loop_1(menuTabLink);
            }
            var _a;
        }
    }
    /*
     * Reopen work order
     */
    var reopenWorkOrderButton = document.querySelector('#button--reopenWorkOrder');
    if (reopenWorkOrderButton !== null) {
        reopenWorkOrderButton.addEventListener('click', function () {
            bulmaJS.confirm({
                contextualColorName: 'warning',
                message: 'Are you sure you want to reopen this work order? This will clear the close date.',
                okButton: {
                    callbackFunction: function () {
                        var workOrderIdElement = document.querySelector('#workOrder--workOrderId');
                        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.workOrdersRouter, "/doReopenWorkOrder"), {
                            workOrderId: workOrderIdElement.value
                        }, function (responseJSON) {
                            if (responseJSON.success) {
                                globalThis.location.href = responseJSON.redirectUrl;
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Reopen Error',
                                    message: responseJSON.errorMessage
                                });
                            }
                        });
                    },
                    text: 'Reopen Work Order'
                },
                title: 'Reopen Work Order'
            });
        });
    }
})();
