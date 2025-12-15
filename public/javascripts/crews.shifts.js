"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    var crewsContainerElement = document.querySelector('#container--crews');
    function deleteCrew(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var crewId = Number.parseInt((_a = buttonElement.dataset.crewId) !== null && _a !== void 0 ? _a : '', 10);
        var crew = exports.crews.find(function (c) { return c.crewId === crewId; });
        if (crew === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Crew',
            message: "Are you sure you want to delete the crew \"".concat(cityssm.escapeHTML(crew.crewName), "\"? This action cannot be undone."),
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Crew',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doDeleteCrew"), {
                        crewId: crewId
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.crews !== undefined) {
                                exports.crews = responseJSON.crews;
                                renderCrews();
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Crew Deleted',
                                message: 'The crew has been deleted successfully.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Crew',
                                message: 'An error occurred while deleting the crew.'
                            });
                        }
                    });
                }
            }
        });
    }
    function openEditCrewModal(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var crewId = Number.parseInt((_a = buttonElement.dataset.crewId) !== null && _a !== void 0 ? _a : '', 10);
        var crew = exports.crews.find(function (c) { return c.crewId === crewId; });
        if (crew === undefined) {
            return;
        }
        var closeModalFunction;
        cityssm.openHtmlModal('shifts-crews-edit', {
            onshow: function (modalElement) {
                var _a, _b, _c;
                ;
                modalElement.querySelector('#crewEdit--crewId').value = crewId.toString();
                modalElement.querySelector('#crewEdit--crewName').value = crew.crewName;
                modalElement.querySelector('#crewEdit--userGroupId').value = (_b = (_a = crew.userGroupId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                (_c = modalElement
                    .querySelector('#form--editCrew')) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', function (formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doUpdateCrew"), formEvent.currentTarget, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.crews !== undefined) {
                                exports.crews = responseJSON.crews;
                                renderCrews();
                            }
                            closeModalFunction();
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Crew updated successfully.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Updating Crew',
                                message: 'An error occurred while updating the crew.'
                            });
                        }
                    });
                });
            },
            onshown: function (modalElement, closeFunction) {
                var _a;
                closeModalFunction = closeFunction;
                (_a = modalElement.querySelector('#crewEdit--crewName')) === null || _a === void 0 ? void 0 : _a.focus();
            }
        });
    }
    function deleteCrewMember(clickEvent) {
        var _a, _b;
        var buttonElement = clickEvent.currentTarget;
        var crewId = Number.parseInt((_a = buttonElement.dataset.crewId) !== null && _a !== void 0 ? _a : '', 10);
        var employeeNumber = (_b = buttonElement.dataset.employeeNumber) !== null && _b !== void 0 ? _b : '';
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Remove Crew Member',
            message: 'Are you sure you want to remove this employee from the crew?',
            okButton: {
                text: 'Remove Member',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doDeleteCrewMember"), {
                        crewId: crewId,
                        employeeNumber: employeeNumber
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.crew !== undefined) {
                            renderCrewDetails(crewId, responseJSON.crew);
                        }
                    });
                }
            }
        });
    }
    function openAddCrewMemberModal(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var crewId = Number.parseInt((_a = buttonElement.dataset.crewId) !== null && _a !== void 0 ? _a : '', 10);
        var closeModalFunction;
        cityssm.openHtmlModal('shifts-crews-addMember', {
            onshow: function (modalElement) {
                var _a;
                ;
                modalElement.querySelector('#crewMemberAdd--crewId').value = crewId.toString();
                // Populate employee dropdown
                var selectElement = modalElement.querySelector('#crewMemberAdd--employeeNumber');
                // Get existing members to exclude them
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doGetCrew"), { crewId: crewId }, function (rawResponseJSON) {
                    var responseJSON = rawResponseJSON;
                    if (responseJSON.success && responseJSON.crew !== undefined) {
                        var existingMemberNumbers = responseJSON.crew.members.map(function (m) { return m.employeeNumber; });
                        for (var _i = 0, _a = exports.employees; _i < _a.length; _i++) {
                            var employee = _a[_i];
                            if (!existingMemberNumbers.includes(employee.employeeNumber)) {
                                var optionElement = document.createElement('option');
                                optionElement.value = employee.employeeNumber;
                                optionElement.textContent = "".concat(employee.lastName, ", ").concat(employee.firstName, " (").concat(employee.employeeNumber, ")");
                                selectElement.appendChild(optionElement);
                            }
                        }
                    }
                });
                (_a = modalElement
                    .querySelector('#form--addCrewMember')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doAddCrewMember"), formEvent.currentTarget, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.crew !== undefined) {
                            renderCrewDetails(crewId, responseJSON.crew);
                            closeModalFunction();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Adding Member',
                                message: 'An error occurred while adding the crew member.'
                            });
                        }
                    });
                });
            },
            onshown: function (_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
            }
        });
    }
    function deleteCrewEquipment(clickEvent) {
        var _a, _b;
        var buttonElement = clickEvent.currentTarget;
        var crewId = Number.parseInt((_a = buttonElement.dataset.crewId) !== null && _a !== void 0 ? _a : '', 10);
        var equipmentNumber = (_b = buttonElement.dataset.equipmentNumber) !== null && _b !== void 0 ? _b : '';
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Remove Equipment',
            message: 'Are you sure you want to remove this equipment from the crew?',
            okButton: {
                text: 'Remove Equipment',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doDeleteCrewEquipment"), {
                        crewId: crewId,
                        equipmentNumber: equipmentNumber
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.crew !== undefined) {
                            renderCrewDetails(crewId, responseJSON.crew);
                        }
                    });
                }
            }
        });
    }
    function updateEquipmentAssignment(changeEvent) {
        var _a, _b;
        var selectElement = changeEvent.currentTarget;
        var crewId = Number.parseInt((_a = selectElement.dataset.crewId) !== null && _a !== void 0 ? _a : '', 10);
        var equipmentNumber = (_b = selectElement.dataset.equipmentNumber) !== null && _b !== void 0 ? _b : '';
        var employeeNumber = selectElement.value;
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doUpdateCrewEquipment"), {
            crewId: crewId,
            equipmentNumber: equipmentNumber,
            employeeNumber: employeeNumber
        }, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            if (responseJSON.success && responseJSON.crew !== undefined) {
                renderCrewDetails(crewId, responseJSON.crew);
            }
        });
    }
    function openAddCrewEquipmentModal(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var crewId = Number.parseInt((_a = buttonElement.dataset.crewId) !== null && _a !== void 0 ? _a : '', 10);
        var closeModalFunction;
        cityssm.openHtmlModal('shifts-crews-addEquipment', {
            onshow: function (modalElement) {
                var _a;
                ;
                modalElement.querySelector('#crewEquipmentAdd--crewId').value = crewId.toString();
                // Populate equipment dropdown
                var equipmentSelectElement = modalElement.querySelector('#crewEquipmentAdd--equipmentNumber');
                // Populate employee dropdown
                var employeeSelectElement = modalElement.querySelector('#crewEquipmentAdd--employeeNumber');
                // Get existing equipment to exclude them
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doGetCrew"), { crewId: crewId }, function (rawResponseJSON) {
                    var responseJSON = rawResponseJSON;
                    if (responseJSON.success && responseJSON.crew !== undefined) {
                        var existingEquipmentNumbers = responseJSON.crew.equipment.map(function (e) { return e.equipmentNumber; });
                        // Populate equipment
                        for (var _i = 0, _a = exports.equipment; _i < _a.length; _i++) {
                            var equipmentItem = _a[_i];
                            if (!existingEquipmentNumbers.includes(equipmentItem.equipmentNumber)) {
                                var optionElement = document.createElement('option');
                                optionElement.value = equipmentItem.equipmentNumber;
                                optionElement.textContent = "".concat(equipmentItem.equipmentName, " (").concat(equipmentItem.equipmentNumber, ")");
                                equipmentSelectElement.appendChild(optionElement);
                            }
                        }
                        // Populate crew members for assignment
                        for (var _b = 0, _c = responseJSON.crew.members; _b < _c.length; _b++) {
                            var member = _c[_b];
                            var optionElement = document.createElement('option');
                            optionElement.value = member.employeeNumber;
                            optionElement.textContent = "".concat(member.lastName, ", ").concat(member.firstName);
                            employeeSelectElement.appendChild(optionElement);
                        }
                    }
                });
                (_a = modalElement
                    .querySelector('#form--addCrewEquipment')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doAddCrewEquipment"), formEvent.currentTarget, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success && responseJSON.crew !== undefined) {
                            renderCrewDetails(crewId, responseJSON.crew);
                            closeModalFunction();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Adding Equipment',
                                message: 'An error occurred while adding the equipment.'
                            });
                        }
                    });
                });
            },
            onshown: function (_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
            }
        });
    }
    function renderCrewDetails(crewId, crew) {
        var _a, _b, _c, _d, _e, _f, _g;
        var detailsElement = document.querySelector("#crew-".concat(crewId, "--details"));
        if (detailsElement === null) {
            return;
        }
        // Check permissions
        var canEdit = exports.canManage ||
            crew.recordCreate_userName === shiftLog.userName;
        // Render members
        var membersHTML = '<div class="panel-block"><strong>Members</strong></div>';
        if (crew.members.length === 0) {
            membersHTML +=
                '<div class="panel-block has-text-grey">No members added yet.</div>';
        }
        else {
            for (var _i = 0, _h = crew.members; _i < _h.length; _i++) {
                var member = _h[_i];
                membersHTML += '<div class="panel-block">';
                membersHTML += '<span class="panel-icon"><i class="fa-solid fa-user"></i></span>';
                membersHTML += "".concat(cityssm.escapeHTML((_a = member.lastName) !== null && _a !== void 0 ? _a : ''), ", ").concat(cityssm.escapeHTML((_b = member.firstName) !== null && _b !== void 0 ? _b : ''));
                if (canEdit) {
                    membersHTML += "<button class=\"button is-small is-danger ml-auto\" data-crew-id=\"".concat(crewId, "\" data-employee-number=\"").concat(cityssm.escapeHTML(member.employeeNumber), "\" data-delete-member type=\"button\">");
                    membersHTML += '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>';
                    membersHTML += '</button>';
                }
                membersHTML += '</div>';
            }
        }
        if (canEdit) {
            membersHTML += '<div class="panel-block">';
            membersHTML += "<button class=\"button is-small is-primary\" data-crew-id=\"".concat(crewId, "\" data-add-member type=\"button\">");
            membersHTML += '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span>';
            membersHTML += '<span>Add Member</span>';
            membersHTML += '</button>';
            membersHTML += '</div>';
        }
        // Render equipment
        var equipmentHTML = '<div class="panel-block"><strong>Equipment</strong></div>';
        if (crew.equipment.length === 0) {
            equipmentHTML +=
                '<div class="panel-block has-text-grey">No equipment added yet.</div>';
        }
        else {
            for (var _j = 0, _k = crew.equipment; _j < _k.length; _j++) {
                var equipmentItem = _k[_j];
                equipmentHTML += '<div class="panel-block is-block">';
                equipmentHTML += '<div class="columns is-mobile is-vcentered">';
                equipmentHTML += '<div class="column">';
                equipmentHTML += '<span class="panel-icon"><i class="fa-solid fa-truck"></i></span>';
                equipmentHTML += cityssm.escapeHTML((_c = equipmentItem.equipmentName) !== null && _c !== void 0 ? _c : '');
                if (canEdit) {
                    equipmentHTML += '<div class="field has-addons mt-2">';
                    equipmentHTML += '<div class="control">';
                    equipmentHTML += '<span class="button is-small is-static">Assigned To</span>';
                    equipmentHTML += '</div>';
                    equipmentHTML += '<div class="control is-expanded">';
                    equipmentHTML += "<div class=\"select is-small is-fullwidth\"><select data-crew-id=\"".concat(crewId, "\" data-equipment-number=\"").concat(cityssm.escapeHTML(equipmentItem.equipmentNumber), "\" data-update-assignment>");
                    equipmentHTML += '<option value="">(Unassigned)</option>';
                    for (var _l = 0, _m = crew.members; _l < _m.length; _l++) {
                        var member = _m[_l];
                        equipmentHTML += "<option value=\"".concat(cityssm.escapeHTML(member.employeeNumber), "\"").concat(equipmentItem.employeeNumber === member.employeeNumber
                            ? ' selected'
                            : '', ">").concat(cityssm.escapeHTML((_d = member.lastName) !== null && _d !== void 0 ? _d : ''), ", ").concat(cityssm.escapeHTML((_e = member.firstName) !== null && _e !== void 0 ? _e : ''), "</option>");
                    }
                    equipmentHTML += '</select></div>';
                    equipmentHTML += '</div>';
                    equipmentHTML += '</div>';
                }
                else if (equipmentItem.employeeNumber !== null) {
                    equipmentHTML += '<div class="is-size-7 has-text-grey mt-1">';
                    equipmentHTML += "Assigned to: ".concat(cityssm.escapeHTML((_f = equipmentItem.employeeLastName) !== null && _f !== void 0 ? _f : ''), ", ").concat(cityssm.escapeHTML((_g = equipmentItem.employeeFirstName) !== null && _g !== void 0 ? _g : ''));
                    equipmentHTML += '</div>';
                }
                equipmentHTML += '</div>';
                if (canEdit) {
                    equipmentHTML += '<div class="column is-narrow">';
                    equipmentHTML += "<button class=\"button is-small is-danger\" data-crew-id=\"".concat(crewId, "\" data-equipment-number=\"").concat(cityssm.escapeHTML(equipmentItem.equipmentNumber), "\" data-delete-equipment type=\"button\">");
                    equipmentHTML += '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>';
                    equipmentHTML += '</button>';
                    equipmentHTML += '</div>';
                }
                equipmentHTML += '</div>';
                equipmentHTML += '</div>';
            }
        }
        if (canEdit) {
            equipmentHTML += '<div class="panel-block">';
            equipmentHTML += "<button class=\"button is-small is-primary\" data-crew-id=\"".concat(crewId, "\" data-add-equipment type=\"button\">");
            equipmentHTML += '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span>';
            equipmentHTML += '<span>Add Equipment</span>';
            equipmentHTML += '</button>';
            equipmentHTML += '</div>';
        }
        detailsElement.innerHTML = membersHTML + equipmentHTML;
        // Add event listeners
        if (canEdit) {
            detailsElement
                .querySelectorAll('[data-delete-member]')
                .forEach(function (buttonElement) {
                buttonElement.addEventListener('click', deleteCrewMember);
            });
            detailsElement
                .querySelectorAll('[data-add-member]')
                .forEach(function (buttonElement) {
                buttonElement.addEventListener('click', openAddCrewMemberModal);
            });
            detailsElement
                .querySelectorAll('[data-delete-equipment]')
                .forEach(function (buttonElement) {
                buttonElement.addEventListener('click', deleteCrewEquipment);
            });
            detailsElement
                .querySelectorAll('[data-add-equipment]')
                .forEach(function (buttonElement) {
                buttonElement.addEventListener('click', openAddCrewEquipmentModal);
            });
            detailsElement
                .querySelectorAll('[data-update-assignment]')
                .forEach(function (selectElement) {
                selectElement.addEventListener('change', updateEquipmentAssignment);
            });
        }
    }
    function expandCrewPanel(clickEvent) {
        var _a;
        var linkElement = clickEvent.currentTarget;
        var crewId = Number.parseInt((_a = linkElement.dataset.crewId) !== null && _a !== void 0 ? _a : '', 10);
        var detailsElement = document.querySelector("#crew-".concat(crewId, "--details"));
        if (detailsElement === null) {
            return;
        }
        // Toggle visibility
        if (detailsElement.innerHTML.trim() !== '') {
            detailsElement.innerHTML = '';
            return;
        }
        // Load crew details
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doGetCrew"), { crewId: crewId }, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            if (responseJSON.success && responseJSON.crew !== undefined) {
                renderCrewDetails(crewId, responseJSON.crew);
            }
        });
    }
    function renderCrews() {
        if (exports.crews.length === 0) {
            crewsContainerElement.innerHTML =
                '<div class="message is-info"><div class="message-body">No crews have been added yet.</div></div>';
            return;
        }
        var crewsHTML = '';
        for (var _i = 0, _a = exports.crews; _i < _a.length; _i++) {
            var crew = _a[_i];
            var canEdit = exports.canManage ||
                crew.recordCreate_userName === shiftLog.userName;
            crewsHTML += '<nav class="panel mb-4">';
            crewsHTML += "<a class=\"panel-heading\" href=\"#\" data-crew-id=\"".concat(crew.crewId, "\" data-expand-crew>");
            crewsHTML += cityssm.escapeHTML(crew.crewName);
            if (crew.userGroupName !== undefined) {
                crewsHTML += " <span class=\"tag is-info ml-2\">".concat(cityssm.escapeHTML(crew.userGroupName), "</span>");
            }
            crewsHTML += '</a>';
            crewsHTML += "<div id=\"crew-".concat(crew.crewId, "--details\"></div>");
            if (canEdit) {
                crewsHTML += '<div class="panel-block">';
                crewsHTML += '<div class="buttons">';
                crewsHTML += "<button class=\"button is-small\" data-crew-id=\"".concat(crew.crewId, "\" data-edit-crew type=\"button\">");
                crewsHTML +=
                    '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>';
                crewsHTML += '<span>Edit Crew</span>';
                crewsHTML += '</button>';
                crewsHTML += "<button class=\"button is-small is-danger\" data-crew-id=\"".concat(crew.crewId, "\" data-delete-crew type=\"button\">");
                crewsHTML +=
                    '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>';
                crewsHTML += '<span>Delete Crew</span>';
                crewsHTML += '</button>';
                crewsHTML += '</div>';
                crewsHTML += '</div>';
            }
            crewsHTML += '</nav>';
        }
        crewsContainerElement.innerHTML = crewsHTML;
        // Add event listeners
        crewsContainerElement
            .querySelectorAll('[data-expand-crew]')
            .forEach(function (linkElement) {
            linkElement.addEventListener('click', function (clickEvent) {
                clickEvent.preventDefault();
                expandCrewPanel(clickEvent);
            });
        });
        crewsContainerElement
            .querySelectorAll('[data-edit-crew]')
            .forEach(function (buttonElement) {
            buttonElement.addEventListener('click', openEditCrewModal);
        });
        crewsContainerElement
            .querySelectorAll('[data-delete-crew]')
            .forEach(function (buttonElement) {
            buttonElement.addEventListener('click', deleteCrew);
        });
    }
    function openAddCrewModal() {
        var closeModalFunction;
        cityssm.openHtmlModal('shifts-crews-add', {
            onshow: function (modalElement) {
                var _a;
                (_a = modalElement
                    .querySelector('#form--addCrew')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.shifts.router, "/doAddCrew"), formEvent.currentTarget, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.crews !== undefined) {
                                exports.crews = responseJSON.crews;
                                renderCrews();
                            }
                            closeModalFunction();
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Crew added successfully.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Adding Crew',
                                message: 'An error occurred while adding the crew.'
                            });
                        }
                    });
                });
            },
            onshown: function (modalElement, closeFunction) {
                var _a;
                closeModalFunction = closeFunction;
                (_a = modalElement.querySelector('#crewAdd--crewName')) === null || _a === void 0 ? void 0 : _a.focus();
            }
        });
    }
    // Initialize
    (_a = document
        .querySelector('#button--addCrew')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', openAddCrewModal);
    renderCrews();
})();
