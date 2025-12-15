"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var shiftDateElement = document.querySelector('#builder--shiftDate');
    var viewModeElement = document.querySelector('#builder--viewMode');
    var resultsContainerElement = document.querySelector('#container--shiftBuilderResults');
    var currentShifts = [];
    // Track locked shifts
    var lockedShifts = new Set();
    function getItemKey(type, id) {
        return "".concat(type, ":").concat(id);
    }
    function findDuplicates(shifts) {
        var _a, _b, _c, _d;
        var tracker = {};
        for (var _i = 0, shifts_1 = shifts; _i < shifts_1.length; _i++) {
            var shift = shifts_1[_i];
            // Track employees
            for (var _e = 0, _f = shift.employees; _e < _f.length; _e++) {
                var employee = _f[_e];
                var key = getItemKey('employee', employee.employeeNumber);
                (_a = tracker[key]) !== null && _a !== void 0 ? _a : (tracker[key] = []);
                tracker[key].push(shift.shiftId);
            }
            // Track equipment
            for (var _g = 0, _h = shift.equipment; _g < _h.length; _g++) {
                var equipment = _h[_g];
                var key = getItemKey('equipment', equipment.equipmentNumber);
                (_b = tracker[key]) !== null && _b !== void 0 ? _b : (tracker[key] = []);
                tracker[key].push(shift.shiftId);
            }
            // Track crews
            for (var _j = 0, _k = shift.crews; _j < _k.length; _j++) {
                var crew = _k[_j];
                var key = getItemKey('crew', crew.crewId);
                (_c = tracker[key]) !== null && _c !== void 0 ? _c : (tracker[key] = []);
                tracker[key].push(shift.shiftId);
            }
            // Track work orders
            for (var _l = 0, _m = shift.workOrders; _l < _m.length; _l++) {
                var workOrder = _m[_l];
                var key = getItemKey('workOrder', workOrder.workOrderId);
                (_d = tracker[key]) !== null && _d !== void 0 ? _d : (tracker[key] = []);
                tracker[key].push(shift.shiftId);
            }
        }
        // Remove items that only appear once
        for (var key in tracker) {
            if (tracker[key].length <= 1) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete tracker[key];
            }
        }
        return tracker;
    }
    function isDuplicate(duplicates, type, id) {
        var key = getItemKey(type, id);
        return duplicates[key] !== undefined;
    }
    function isShiftEditable(shift) {
        if (!shiftLog.canUpdate) {
            return false;
        }
        var shiftDate = new Date(shift.shiftDate);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return shiftDate >= today;
    }
    function wasUpdatedByOther(shift) {
        return (shift.recordUpdate_userName !== undefined &&
            shift.recordUpdate_userName !== shiftLog.currentUser &&
            shift.recordUpdate_userName !== shift.recordCreate_userName);
    }
    function renderEmployeesView(shift, duplicates) {
        var _a, _b, _c;
        var isEditable = isShiftEditable(shift);
        var isLocked = lockedShifts.has(shift.shiftId);
        var isDraggable = isEditable && !isLocked;
        var containerElement = document.createElement('div');
        containerElement.className = 'shift-details';
        // Crews
        if (shift.crews.length > 0) {
            var crewsSection = document.createElement('div');
            crewsSection.className = 'mb-3';
            var crewsLabel = document.createElement('strong');
            crewsLabel.textContent = 'Crews:';
            crewsSection.append(crewsLabel);
            var crewsList = document.createElement('ul');
            crewsList.className = 'ml-4';
            for (var _i = 0, _d = shift.crews; _i < _d.length; _i++) {
                var crew = _d[_i];
                var isDup = isDuplicate(duplicates, 'crew', crew.crewId);
                var crewItem = document.createElement('li');
                if (isDup) {
                    crewItem.classList.add('has-background-warning-light');
                }
                if (isEditable) {
                    crewItem.classList.add('drop-target-crew');
                }
                if (isDraggable) {
                    crewItem.draggable = true;
                }
                crewItem.dataset.crewId = crew.crewId.toString();
                // Add icon
                var icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-users"></i>';
                crewItem.append(icon, ' ');
                // Add crew name
                var nameSpan = document.createElement('span');
                nameSpan.textContent = crew.crewName;
                crewItem.append(nameSpan);
                if (crew.shiftCrewNote !== '') {
                    var noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = " - ".concat(crew.shiftCrewNote);
                    crewItem.append(noteSpan);
                }
                crewsList.append(crewItem);
            }
            crewsSection.append(crewsList);
            containerElement.append(crewsSection);
        }
        // Employees
        if (shift.employees.length > 0) {
            var employeesSection = document.createElement('div');
            employeesSection.className = 'mb-3';
            var employeesLabel = document.createElement('strong');
            employeesLabel.textContent = 'Employees:';
            employeesSection.append(employeesLabel);
            var employeesList = document.createElement('ul');
            employeesList.className = 'ml-4';
            for (var _e = 0, _f = shift.employees; _e < _f.length; _e++) {
                var employee = _f[_e];
                var isDup = isDuplicate(duplicates, 'employee', employee.employeeNumber);
                var employeeItem = document.createElement('li');
                if (isDup) {
                    employeeItem.classList.add('has-background-warning-light');
                }
                if (isEditable) {
                    employeeItem.classList.add('drop-target-employee');
                }
                if (isDraggable) {
                    employeeItem.draggable = true;
                }
                employeeItem.dataset.employeeNumber = employee.employeeNumber;
                employeeItem.dataset.crewId = (_b = (_a = employee.crewId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                // Add icon
                var icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-user"></i>';
                employeeItem.append(icon, ' ');
                // Add employee name with number in smaller text
                var nameSpan = document.createElement('span');
                nameSpan.textContent = "".concat(employee.lastName, ", ").concat(employee.firstName, " ");
                employeeItem.append(nameSpan);
                var numberSpan = document.createElement('span');
                numberSpan.className = 'is-size-7 has-text-grey';
                numberSpan.textContent = "(#".concat(employee.employeeNumber, ")");
                employeeItem.append(numberSpan);
                if (employee.crewName !== null) {
                    var crewTag = document.createElement('span');
                    crewTag.className = 'tag is-small is-info is-light ml-1';
                    crewTag.textContent = employee.crewName;
                    employeeItem.append(' ', crewTag);
                }
                if (employee.shiftEmployeeNote !== '') {
                    var noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = " - ".concat(employee.shiftEmployeeNote);
                    employeeItem.append(noteSpan);
                }
                employeesList.append(employeeItem);
            }
            employeesSection.append(employeesList);
            containerElement.append(employeesSection);
        }
        // Equipment
        if (shift.equipment.length > 0) {
            var equipmentSection = document.createElement('div');
            equipmentSection.className = 'mb-3';
            var equipmentLabel = document.createElement('strong');
            equipmentLabel.textContent = 'Equipment:';
            equipmentSection.append(equipmentLabel);
            var equipmentList = document.createElement('ul');
            equipmentList.className = 'ml-4';
            for (var _g = 0, _h = shift.equipment; _g < _h.length; _g++) {
                var equipment = _h[_g];
                var isDup = isDuplicate(duplicates, 'equipment', equipment.equipmentNumber);
                var equipmentItem = document.createElement('li');
                if (isDup) {
                    equipmentItem.classList.add('has-background-warning-light');
                }
                if (isDraggable) {
                    equipmentItem.draggable = true;
                }
                equipmentItem.dataset.equipmentNumber = equipment.equipmentNumber;
                // Add icon
                var icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-truck"></i>';
                equipmentItem.append(icon, ' ');
                // Add equipment name with number in smaller text
                var nameSpan = document.createElement('span');
                nameSpan.textContent = "".concat(equipment.equipmentName, " ");
                equipmentItem.append(nameSpan);
                var numberSpan = document.createElement('span');
                numberSpan.className = 'is-size-7 has-text-grey';
                numberSpan.textContent = "(#".concat(equipment.equipmentNumber, ")");
                equipmentItem.append(numberSpan);
                if (equipment.employeeFirstName !== null) {
                    var operatorSpan = document.createElement('span');
                    operatorSpan.className = 'has-text-grey-light';
                    operatorSpan.textContent = " (".concat((_c = equipment.employeeLastName) !== null && _c !== void 0 ? _c : '', ", ").concat(equipment.employeeFirstName, ")");
                    equipmentItem.append(operatorSpan);
                }
                if (equipment.shiftEquipmentNote !== '') {
                    var noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = " - ".concat(equipment.shiftEquipmentNote);
                    equipmentItem.append(noteSpan);
                }
                equipmentList.append(equipmentItem);
            }
            equipmentSection.append(equipmentList);
            containerElement.append(equipmentSection);
        }
        if (shift.crews.length === 0 &&
            shift.employees.length === 0 &&
            shift.equipment.length === 0) {
            var emptyMessage = document.createElement('p');
            emptyMessage.className = 'has-text-grey-light';
            emptyMessage.textContent = 'No employees or equipment assigned';
            containerElement.append(emptyMessage);
        }
        return containerElement;
    }
    function renderTasksView(shift, duplicates) {
        var isEditable = isShiftEditable(shift);
        var isLocked = lockedShifts.has(shift.shiftId);
        var isDraggable = isEditable && !isLocked;
        var containerElement = document.createElement('div');
        containerElement.className = 'shift-details';
        if (shift.workOrders.length > 0) {
            var workOrdersSection = document.createElement('div');
            workOrdersSection.className = 'mb-3';
            var workOrdersLabel = document.createElement('strong');
            workOrdersLabel.textContent = 'Work Orders:';
            workOrdersSection.append(workOrdersLabel);
            var workOrdersList = document.createElement('ul');
            workOrdersList.className = 'ml-4';
            for (var _i = 0, _a = shift.workOrders; _i < _a.length; _i++) {
                var workOrder = _a[_i];
                var isDup = isDuplicate(duplicates, 'workOrder', workOrder.workOrderId);
                var workOrderItem = document.createElement('li');
                if (isDup) {
                    workOrderItem.classList.add('has-background-warning-light');
                }
                if (isDraggable) {
                    workOrderItem.draggable = true;
                }
                workOrderItem.dataset.workorderId = workOrder.workOrderId.toString();
                // Add icon
                var icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-clipboard-list"></i>';
                workOrderItem.append(icon, ' ');
                // Add work order link
                var workOrderLink = document.createElement('a');
                workOrderLink.href = "".concat(shiftLog.urlPrefix, "/workOrders/").concat(workOrder.workOrderId);
                workOrderLink.target = '_blank';
                workOrderLink.textContent = workOrder.workOrderNumber;
                workOrderItem.append(workOrderLink);
                if (workOrder.workOrderDetails !== '') {
                    workOrderItem.append(" - ".concat(workOrder.workOrderDetails));
                }
                if (workOrder.shiftWorkOrderNote !== '') {
                    var noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = " - ".concat(workOrder.shiftWorkOrderNote);
                    workOrderItem.append(noteSpan);
                }
                workOrdersList.append(workOrderItem);
            }
            workOrdersSection.append(workOrdersList);
            containerElement.append(workOrdersSection);
        }
        else {
            var emptyMessage = document.createElement('p');
            emptyMessage.className = 'has-text-grey-light';
            emptyMessage.textContent = 'No work orders assigned';
            containerElement.append(emptyMessage);
        }
        return containerElement;
    }
    function renderShiftCard(shift, duplicates, viewMode) {
        var _a, _b, _c, _d;
        var cardElement = document.createElement('div');
        cardElement.className = 'column is-half-tablet is-one-third-desktop';
        cardElement.dataset.shiftId = shift.shiftId.toString();
        var updatedByOther = wasUpdatedByOther(shift);
        var isEditable = isShiftEditable(shift);
        var boxElement = document.createElement('div');
        boxElement.className = 'box';
        if (updatedByOther) {
            boxElement.classList.add('has-background-warning-light');
        }
        // Header
        var headerLevel = document.createElement('div');
        headerLevel.className = 'level is-mobile mb-3';
        var levelLeft = document.createElement('div');
        levelLeft.className = 'level-left';
        // Lock button (if editable)
        if (isEditable) {
            var lockItem = document.createElement('div');
            lockItem.className = 'level-item';
            var lockButton = document.createElement('button');
            lockButton.className = 'button is-small is-ghost';
            lockButton.type = 'button';
            lockButton.title = 'Lock/Unlock shift';
            lockButton.dataset.shiftId = shift.shiftId.toString();
            var isLocked = lockedShifts.has(shift.shiftId);
            var lockIcon = document.createElement('span');
            lockIcon.className = 'icon is-small';
            lockIcon.innerHTML = isLocked
                ? '<i class="fa-solid fa-lock has-text-danger"></i>'
                : '<i class="fa-solid fa-lock-open has-text-success"></i>';
            lockButton.append(lockIcon);
            lockButton.addEventListener('click', function () {
                toggleShiftLock(shift.shiftId);
            });
            lockItem.append(lockButton);
            levelLeft.append(lockItem);
        }
        var levelLeftItem = document.createElement('div');
        levelLeftItem.className = 'level-item';
        var titleElement = document.createElement('h3');
        titleElement.className = 'title is-5 mb-0';
        var titleLink = document.createElement('a');
        titleLink.href = "".concat(shiftLog.urlPrefix, "/shifts/").concat(shift.shiftId);
        titleLink.textContent = "#".concat(shift.shiftId, " - ").concat((_a = shift.shiftTypeDataListItem) !== null && _a !== void 0 ? _a : 'Shift');
        titleElement.append(titleLink);
        levelLeftItem.append(titleElement);
        levelLeft.append(levelLeftItem);
        headerLevel.append(levelLeft);
        var levelRight = document.createElement('div');
        levelRight.className = 'level-right';
        if (updatedByOther) {
            var warningItem = document.createElement('div');
            warningItem.className = 'level-item';
            var warningIcon = document.createElement('span');
            warningIcon.className = 'icon has-text-warning';
            warningIcon.title = 'Modified by another user';
            warningIcon.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i>';
            warningItem.append(warningIcon);
            levelRight.append(warningItem);
        }
        if (isEditable) {
            var editItem = document.createElement('div');
            editItem.className = 'level-item';
            var editLink = document.createElement('a');
            editLink.href = "".concat(shiftLog.urlPrefix, "/shifts/").concat(shift.shiftId, "/edit");
            editLink.className = 'button is-small is-light';
            editLink.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>';
            editItem.append(editLink);
            levelRight.append(editItem);
        }
        headerLevel.append(levelRight);
        boxElement.append(headerLevel);
        // Shift details
        var contentElement = document.createElement('div');
        contentElement.className = 'content is-small';
        var timeParagraph = document.createElement('p');
        timeParagraph.className = 'mb-2';
        var timeLabel = document.createElement('strong');
        timeLabel.textContent = 'Time:';
        timeParagraph.append(timeLabel, " ".concat((_b = shift.shiftTimeDataListItem) !== null && _b !== void 0 ? _b : ''));
        contentElement.append(timeParagraph);
        // Make supervisor field a drop target for employees
        var supervisorParagraph = document.createElement('p');
        supervisorParagraph.className = 'mb-2';
        if (isEditable) {
            supervisorParagraph.classList.add('drop-target-supervisor');
        }
        supervisorParagraph.dataset.shiftId = shift.shiftId.toString();
        supervisorParagraph.dataset.supervisorEmployeeNumber = shift.supervisorEmployeeNumber;
        var supervisorLabel = document.createElement('strong');
        supervisorLabel.textContent = 'Supervisor:';
        supervisorParagraph.append(supervisorLabel, " ".concat((_c = shift.supervisorLastName) !== null && _c !== void 0 ? _c : '', ", ").concat((_d = shift.supervisorFirstName) !== null && _d !== void 0 ? _d : ''));
        contentElement.append(supervisorParagraph);
        if (shift.shiftDescription !== '') {
            var descParagraph = document.createElement('p');
            descParagraph.className = 'mb-2';
            var descLabel = document.createElement('strong');
            descLabel.textContent = 'Description:';
            descParagraph.append(descLabel, " ".concat(shift.shiftDescription));
            contentElement.append(descParagraph);
        }
        boxElement.append(contentElement);
        var hrElement = document.createElement('hr');
        hrElement.className = 'my-3';
        boxElement.append(hrElement);
        // View-specific content
        var viewContent = viewMode === 'employees'
            ? renderEmployeesView(shift, duplicates)
            : renderTasksView(shift, duplicates);
        boxElement.append(viewContent);
        cardElement.append(boxElement);
        return cardElement;
    }
    function renderShifts() {
        resultsContainerElement.innerHTML = '';
        if (currentShifts.length === 0) {
            resultsContainerElement.innerHTML = /* html */ "\n        <div class=\"message is-info\">\n          <div class=\"message-body\">\n            No shifts found for the selected date.\n          </div>\n        </div>\n      ";
            return;
        }
        var duplicates = findDuplicates(currentShifts);
        var viewMode = viewModeElement.value;
        var columnsElement = document.createElement('div');
        columnsElement.className = 'columns is-multiline';
        for (var _i = 0, currentShifts_1 = currentShifts; _i < currentShifts_1.length; _i++) {
            var shift = currentShifts_1[_i];
            var shiftCard = renderShiftCard(shift, duplicates, viewMode);
            columnsElement.append(shiftCard);
        }
        resultsContainerElement.append(columnsElement);
    }
    function loadShifts() {
        var shiftDateString = shiftDateElement.value;
        if (shiftDateString === '') {
            return;
        }
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doGetShiftsForBuilder"), {
            shiftDateString: shiftDateString
        }, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                currentShifts = responseJSON.shifts;
                renderShifts();
                loadAvailableResources();
            }
        });
    }
    function loadAvailableResources() {
        // Only load if the available resources sidebar exists (user has canUpdate permission)
        var availableResourcesContainer = document.querySelector('#container--availableResources');
        if (availableResourcesContainer === null) {
            return;
        }
        var shiftDateString = shiftDateElement.value;
        if (shiftDateString === '') {
            return;
        }
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doGetAvailableResources"), {
            shiftDateString: shiftDateString
        }, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderAvailableResources(responseJSON);
            }
        });
    }
    function renderAvailableResources(resources) {
        // Render employees
        var employeesList = document.querySelector('#available--employees .available-resources-list');
        if (employeesList !== null) {
            employeesList.textContent = '';
            if (resources.employees.length === 0) {
                var emptyMessage = document.createElement('p');
                emptyMessage.className = 'has-text-grey-light is-size-7';
                emptyMessage.textContent = 'No available employees';
                employeesList.append(emptyMessage);
            }
            else {
                var itemsContainer = document.createElement('div');
                itemsContainer.className = 'available-items';
                for (var _i = 0, _a = resources.employees; _i < _a.length; _i++) {
                    var employee = _a[_i];
                    var itemBox = document.createElement('div');
                    itemBox.className = 'box is-paddingless p-2 mb-2 is-clickable';
                    itemBox.draggable = true;
                    itemBox.dataset.employeeNumber = employee.employeeNumber;
                    itemBox.dataset.fromAvailable = 'true';
                    // Add icon
                    var icon = document.createElement('span');
                    icon.className = 'icon is-small';
                    icon.innerHTML = '<i class="fa-solid fa-user"></i>';
                    itemBox.append(icon, ' ');
                    // Add employee name with number
                    var itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = "".concat(employee.lastName, ", ").concat(employee.firstName, " ");
                    itemBox.append(itemText);
                    var numberSpan = document.createElement('span');
                    numberSpan.className = 'is-size-7 has-text-grey';
                    numberSpan.textContent = "(#".concat(employee.employeeNumber, ")");
                    itemBox.append(numberSpan);
                    itemsContainer.append(itemBox);
                }
                employeesList.append(itemsContainer);
            }
        }
        // Render equipment
        var equipmentList = document.querySelector('#available--equipment .available-resources-list');
        if (equipmentList !== null) {
            equipmentList.textContent = '';
            if (resources.equipment.length === 0) {
                var emptyMessage = document.createElement('p');
                emptyMessage.className = 'has-text-grey-light is-size-7';
                emptyMessage.textContent = 'No available equipment';
                equipmentList.append(emptyMessage);
            }
            else {
                var itemsContainer = document.createElement('div');
                itemsContainer.className = 'available-items';
                for (var _b = 0, _c = resources.equipment; _b < _c.length; _b++) {
                    var equipment = _c[_b];
                    var itemBox = document.createElement('div');
                    itemBox.className = 'box is-paddingless p-2 mb-2 is-clickable';
                    itemBox.draggable = true;
                    itemBox.dataset.equipmentNumber = equipment.equipmentNumber;
                    itemBox.dataset.fromAvailable = 'true';
                    // Add icon
                    var icon = document.createElement('span');
                    icon.className = 'icon is-small';
                    icon.innerHTML = '<i class="fa-solid fa-truck"></i>';
                    itemBox.append(icon, ' ');
                    // Add equipment name with number
                    var itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = "".concat(equipment.equipmentName, " ");
                    itemBox.append(itemText);
                    var numberSpan = document.createElement('span');
                    numberSpan.className = 'is-size-7 has-text-grey';
                    numberSpan.textContent = "(#".concat(equipment.equipmentNumber, ")");
                    itemBox.append(numberSpan);
                    itemsContainer.append(itemBox);
                }
                equipmentList.append(itemsContainer);
            }
        }
        // Render crews
        var crewsList = document.querySelector('#available--crews .available-resources-list');
        if (crewsList !== null) {
            crewsList.textContent = '';
            if (resources.crews.length === 0) {
                var emptyMessage = document.createElement('p');
                emptyMessage.className = 'has-text-grey-light is-size-7';
                emptyMessage.textContent = 'No available crews';
                crewsList.append(emptyMessage);
            }
            else {
                var itemsContainer = document.createElement('div');
                itemsContainer.className = 'available-items';
                for (var _d = 0, _e = resources.crews; _d < _e.length; _d++) {
                    var crew = _e[_d];
                    var itemBox = document.createElement('div');
                    itemBox.className = 'box is-paddingless p-2 mb-2 is-clickable';
                    itemBox.draggable = true;
                    itemBox.dataset.crewId = crew.crewId.toString();
                    itemBox.dataset.fromAvailable = 'true';
                    // Add icon
                    var icon = document.createElement('span');
                    icon.className = 'icon is-small';
                    icon.innerHTML = '<i class="fa-solid fa-users"></i>';
                    itemBox.append(icon, ' ');
                    // Add crew name
                    var itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = crew.crewName;
                    itemBox.append(itemText);
                    itemsContainer.append(itemBox);
                }
                crewsList.append(itemsContainer);
            }
        }
    }
    // Lock/unlock functionality
    function toggleShiftLock(shiftId) {
        if (lockedShifts.has(shiftId)) {
            lockedShifts.delete(shiftId);
        }
        else {
            lockedShifts.add(shiftId);
        }
        // Re-render shifts to update lock button and draggable states
        renderShifts();
    }
    // Drag and drop state
    var draggedElement = null;
    var draggedData = null;
    // Drag and drop handlers
    function handleDragStart(event) {
        var _a;
        var target = event.target;
        var employeeNumber = target.dataset.employeeNumber;
        var equipmentNumber = target.dataset.equipmentNumber;
        var crewId = target.dataset.crewId;
        var workorderId = target.dataset.workorderId;
        var fromAvailable = target.dataset.fromAvailable === 'true';
        var shiftCard = target.closest('[data-shift-id]');
        var fromShiftId = fromAvailable
            ? 0
            : Number.parseInt((_a = shiftCard === null || shiftCard === void 0 ? void 0 : shiftCard.dataset.shiftId) !== null && _a !== void 0 ? _a : '0', 10);
        // Prevent dragging from locked shifts
        if (fromShiftId !== 0 && lockedShifts.has(fromShiftId)) {
            event.preventDefault();
            return;
        }
        draggedElement = target;
        target.classList.add('is-dragging');
        if (employeeNumber !== undefined) {
            draggedData = {
                fromShiftId: fromShiftId,
                id: employeeNumber,
                type: 'employee'
            };
        }
        else if (equipmentNumber !== undefined) {
            draggedData = {
                fromShiftId: fromShiftId,
                id: equipmentNumber,
                type: 'equipment'
            };
        }
        else if (crewId !== undefined) {
            draggedData = {
                fromShiftId: fromShiftId,
                id: Number.parseInt(crewId, 10),
                type: 'crew'
            };
        }
        else if (workorderId !== undefined) {
            draggedData = {
                fromShiftId: fromShiftId,
                id: Number.parseInt(workorderId, 10),
                type: 'workOrder'
            };
        }
        if (event.dataTransfer !== null) {
            event.dataTransfer.effectAllowed = 'move';
        }
    }
    function handleDragEnd(event) {
        var target = event.target;
        target.classList.remove('is-dragging');
        draggedElement = null;
        draggedData = null;
        // Remove all drop zone highlights
        for (var _i = 0, _a = document.querySelectorAll('.is-drop-target'); _i < _a.length; _i++) {
            var element = _a[_i];
            element.classList.remove('is-drop-target');
        }
    }
    function handleDragOver(event) {
        event.preventDefault();
        var target = event.target;
        // Remove existing highlights
        for (var _i = 0, _a = document.querySelectorAll('.is-drop-target'); _i < _a.length; _i++) {
            var element = _a[_i];
            element.classList.remove('is-drop-target');
        }
        // Check if hovering over available resources sidebar (to remove from shift)
        var availableResourcesSidebar = target.closest('#container--availableResources');
        if (availableResourcesSidebar !== null &&
            draggedData !== null &&
            draggedData.fromShiftId > 0) {
            // Highlight the sidebar box when dragging from a shift to remove
            var sidebarBox = availableResourcesSidebar.querySelector('.box');
            if (sidebarBox !== null) {
                sidebarBox.classList.add('is-drop-target');
            }
            if (event.dataTransfer !== null) {
                event.dataTransfer.dropEffect = 'move';
            }
            return;
        }
        // Check for specific drop targets first
        var supervisorTarget = target.closest('.drop-target-supervisor');
        var crewTarget = target.closest('.drop-target-crew');
        var employeeTarget = target.closest('.drop-target-employee');
        // Highlight specific drop targets based on what's being dragged
        if ((draggedData === null || draggedData === void 0 ? void 0 : draggedData.type) === 'employee' && supervisorTarget !== null) {
            supervisorTarget.classList.add('is-drop-target');
        }
        else if ((draggedData === null || draggedData === void 0 ? void 0 : draggedData.type) === 'employee' && crewTarget !== null) {
            crewTarget.classList.add('is-drop-target');
        }
        else if ((draggedData === null || draggedData === void 0 ? void 0 : draggedData.type) === 'equipment' && employeeTarget !== null) {
            employeeTarget.classList.add('is-drop-target');
        }
        else {
            // Default: highlight entire shift box
            var shiftBox = target.closest('.box');
            if (shiftBox !== null &&
                !shiftBox.closest('#container--availableResources')) {
                shiftBox.classList.add('is-drop-target');
            }
        }
        if (event.dataTransfer !== null) {
            event.dataTransfer.dropEffect = 'move';
        }
    }
    function handleDragLeave(event) {
        var target = event.target;
        var shiftBox = target.closest('.box');
        if (shiftBox !== null) {
            shiftBox.classList.remove('is-drop-target');
        }
    }
    function handleDrop(event) {
        var _a, _b, _c, _d, _e, _f;
        event.preventDefault();
        var target = event.target;
        target.classList.remove('is-drop-target');
        if (draggedData === null) {
            return;
        }
        // Check if dropped on available resources sidebar (to remove from shift)
        var availableResourcesSidebar = target.closest('#container--availableResources');
        if (availableResourcesSidebar !== null && draggedData.fromShiftId > 0) {
            removeFromShift(draggedData);
            return;
        }
        // Check for specific drop targets first
        var supervisorTarget = target.closest('.drop-target-supervisor');
        var crewTarget = target.closest('.drop-target-crew');
        var employeeTarget = target.closest('.drop-target-employee');
        // Handle employee dropped on supervisor slot
        if (supervisorTarget !== null && draggedData.type === 'employee') {
            var shiftId = Number.parseInt((_a = supervisorTarget.dataset.shiftId) !== null && _a !== void 0 ? _a : '0', 10);
            // Prevent dropping on locked shifts
            if (shiftId > 0 && !lockedShifts.has(shiftId)) {
                makeEmployeeSupervisor(draggedData.id, shiftId);
                return;
            }
        }
        // Handle employee dropped on crew
        if (crewTarget !== null && draggedData.type === 'employee') {
            var shiftCard_1 = crewTarget.closest('[data-shift-id]');
            var shiftId = Number.parseInt((_b = shiftCard_1 === null || shiftCard_1 === void 0 ? void 0 : shiftCard_1.dataset.shiftId) !== null && _b !== void 0 ? _b : '0', 10);
            var crewId = Number.parseInt((_c = crewTarget.dataset.crewId) !== null && _c !== void 0 ? _c : '0', 10);
            // Prevent dropping on locked shifts
            if (shiftId > 0 && crewId > 0 && !lockedShifts.has(shiftId)) {
                assignEmployeeToCrew(draggedData.id, draggedData.fromShiftId, shiftId, crewId);
                return;
            }
        }
        // Handle equipment dropped on employee
        if (employeeTarget !== null && draggedData.type === 'equipment') {
            var shiftCard_2 = employeeTarget.closest('[data-shift-id]');
            var shiftId = Number.parseInt((_d = shiftCard_2 === null || shiftCard_2 === void 0 ? void 0 : shiftCard_2.dataset.shiftId) !== null && _d !== void 0 ? _d : '0', 10);
            var employeeNumber = (_e = employeeTarget.dataset.employeeNumber) !== null && _e !== void 0 ? _e : '';
            // Prevent dropping on locked shifts
            if (shiftId > 0 && employeeNumber !== '' && !lockedShifts.has(shiftId)) {
                assignEquipmentToEmployee(draggedData.id, draggedData.fromShiftId, shiftId, employeeNumber);
                return;
            }
        }
        // Default: move to shift
        var shiftCard = target.closest('[data-shift-id]');
        var toShiftId = Number.parseInt((_f = shiftCard === null || shiftCard === void 0 ? void 0 : shiftCard.dataset.shiftId) !== null && _f !== void 0 ? _f : '0', 10);
        if (toShiftId === 0 || toShiftId === draggedData.fromShiftId) {
            return;
        }
        // Prevent dropping on locked shifts
        if (lockedShifts.has(toShiftId)) {
            return;
        }
        // Handle different drop scenarios
        switch (draggedData.type) {
            case 'crew': {
                moveCrew(draggedData.id, draggedData.fromShiftId, toShiftId);
                break;
            }
            case 'employee': {
                moveEmployee(draggedData.id, draggedData.fromShiftId, toShiftId);
                break;
            }
            case 'equipment': {
                moveEquipment(draggedData.id, draggedData.fromShiftId, toShiftId);
                break;
            }
            case 'workOrder': {
                moveWorkOrder(draggedData.id, draggedData.fromShiftId, toShiftId);
                break;
            }
            // No default
        }
    }
    function removeFromShift(draggedData) {
        switch (draggedData.type) {
            case 'crew': {
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftCrew"), {
                    crewId: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, function (response) {
                    if (response.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Crew removed from shift.'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to remove crew from shift.',
                            title: 'Error'
                        });
                    }
                });
                break;
            }
            case 'employee': {
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftEmployee"), {
                    employeeNumber: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, function (response) {
                    if (response.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Employee removed from shift.'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to remove employee from shift.',
                            title: 'Error'
                        });
                    }
                });
                break;
            }
            case 'equipment': {
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftEquipment"), {
                    equipmentNumber: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, function (response) {
                    if (response.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Equipment removed from shift.'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to remove equipment from shift.',
                            title: 'Error'
                        });
                    }
                });
                break;
            }
            // No default
        }
    }
    function moveEmployee(employeeNumber, fromShiftId, toShiftId) {
        // If fromShiftId is 0, employee is from available resources
        if (fromShiftId === 0) {
            // Just add to new shift
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftEmployee"), {
                employeeNumber: employeeNumber,
                shiftEmployeeNote: '',
                shiftId: toShiftId
            }, function (addResponse) {
                if (addResponse.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Employee has been added to the shift.',
                        title: 'Employee Added'
                    });
                    loadShifts();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to add employee to shift.',
                        title: 'Error'
                    });
                }
            });
            return;
        }
        // Delete from old shift
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftEmployee"), {
            employeeNumber: employeeNumber,
            shiftId: fromShiftId
        }, function (deleteResponse) {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftEmployee"), {
                    employeeNumber: employeeNumber,
                    shiftEmployeeNote: '',
                    shiftId: toShiftId
                }, function (addResponse) {
                    if (addResponse.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Employee has been moved to the new shift.',
                            title: 'Employee Moved'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to add employee to new shift.',
                            title: 'Error'
                        });
                    }
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to remove employee from original shift.',
                    title: 'Error'
                });
            }
        });
    }
    function moveEquipment(equipmentNumber, fromShiftId, toShiftId) {
        // If fromShiftId is 0, equipment is from available resources
        if (fromShiftId === 0) {
            // Just add to new shift
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftEquipment"), {
                equipmentNumber: equipmentNumber,
                shiftEquipmentNote: '',
                shiftId: toShiftId
            }, function (addResponse) {
                if (addResponse.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Equipment has been added to the shift.',
                        title: 'Equipment Added'
                    });
                    loadShifts();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to add equipment to shift.',
                        title: 'Error'
                    });
                }
            });
            return;
        }
        // Delete from old shift
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftEquipment"), {
            equipmentNumber: equipmentNumber,
            shiftId: fromShiftId
        }, function (deleteResponse) {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftEquipment"), {
                    equipmentNumber: equipmentNumber,
                    shiftEquipmentNote: '',
                    shiftId: toShiftId
                }, function (addResponse) {
                    if (addResponse.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Equipment has been moved to the new shift.',
                            title: 'Equipment Moved'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to add equipment to new shift.',
                            title: 'Error'
                        });
                    }
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to remove equipment from original shift.',
                    title: 'Error'
                });
            }
        });
    }
    function moveCrew(crewId, fromShiftId, toShiftId) {
        // If fromShiftId is 0, crew is from available resources
        if (fromShiftId === 0) {
            // Just add to new shift
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftCrew"), {
                crewId: crewId,
                shiftCrewNote: '',
                shiftId: toShiftId
            }, function (addResponse) {
                if (addResponse.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Crew has been added to the shift.',
                        title: 'Crew Added'
                    });
                    loadShifts();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to add crew to shift.',
                        title: 'Error'
                    });
                }
            });
            return;
        }
        // Delete from old shift
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftCrew"), {
            crewId: crewId,
            shiftId: fromShiftId
        }, function (deleteResponse) {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftCrew"), {
                    crewId: crewId,
                    shiftCrewNote: '',
                    shiftId: toShiftId
                }, function (addResponse) {
                    if (addResponse.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Crew has been moved to the new shift.',
                            title: 'Crew Moved'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to add crew to new shift.',
                            title: 'Error'
                        });
                    }
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to remove crew from original shift.',
                    title: 'Error'
                });
            }
        });
    }
    function moveWorkOrder(workOrderId, fromShiftId, toShiftId) {
        // Delete from old shift
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftWorkOrder"), {
            shiftId: fromShiftId,
            workOrderId: workOrderId
        }, function (deleteResponse) {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftWorkOrder"), {
                    shiftId: toShiftId,
                    shiftWorkOrderNote: '',
                    workOrderId: workOrderId
                }, function (addResponse) {
                    if (addResponse.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Work order has been moved to the new shift.',
                            title: 'Work Order Moved'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to add work order to new shift.',
                            title: 'Error'
                        });
                    }
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to remove work order from original shift.',
                    title: 'Error'
                });
            }
        });
    }
    function makeEmployeeSupervisor(employeeNumber, shiftId) {
        // Get the shift details first to get current values
        var shift = currentShifts.find(function (s) { return s.shiftId === shiftId; });
        if (shift === undefined) {
            return;
        }
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doUpdateShift"), {
            shiftDateString: shift.shiftDate,
            shiftDescription: shift.shiftDescription,
            shiftId: shiftId,
            shiftTimeDataListItemId: shift.shiftTimeDataListItemId,
            shiftTypeDataListItemId: shift.shiftTypeDataListItemId,
            supervisorEmployeeNumber: employeeNumber
        }, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Employee has been set as the supervisor for this shift.',
                    title: 'Supervisor Updated'
                });
                loadShifts();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to update shift supervisor.',
                    title: 'Error'
                });
            }
        });
    }
    function assignEmployeeToCrew(employeeNumber, fromShiftId, toShiftId, crewId) {
        // If employee is on a different shift, move them first
        if (fromShiftId === toShiftId) {
            // Same shift, just update the crew assignment
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doUpdateShiftEmployee"), {
                crewId: crewId,
                employeeNumber: employeeNumber,
                shiftId: toShiftId
            }, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Employee has been assigned to the crew.',
                        title: 'Employee Assigned'
                    });
                    loadShifts();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to assign employee to crew.',
                        title: 'Error'
                    });
                }
            });
        }
        else {
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftEmployee"), {
                employeeNumber: employeeNumber,
                shiftId: fromShiftId
            }, function (deleteResponse) {
                if (deleteResponse.success) {
                    // Add to new shift with crew assignment
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftEmployee"), {
                        crewId: crewId,
                        employeeNumber: employeeNumber,
                        shiftEmployeeNote: '',
                        shiftId: toShiftId
                    }, function (addResponse) {
                        if (addResponse.success) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Employee has been moved and assigned to the crew.',
                                title: 'Employee Assigned'
                            });
                            loadShifts();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: 'Failed to add employee to crew.',
                                title: 'Error'
                            });
                        }
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to remove employee from original shift.',
                        title: 'Error'
                    });
                }
            });
        }
    }
    function assignEquipmentToEmployee(equipmentNumber, fromShiftId, toShiftId, employeeNumber) {
        // If equipment is on a different shift, move it first
        if (fromShiftId === toShiftId) {
            // Same shift, just update the employee assignment
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doUpdateShiftEquipment"), {
                employeeNumber: employeeNumber,
                equipmentNumber: equipmentNumber,
                shiftId: toShiftId
            }, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Equipment has been assigned to the employee.',
                        title: 'Equipment Assigned'
                    });
                    loadShifts();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to assign equipment to employee.',
                        title: 'Error'
                    });
                }
            });
        }
        else {
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doDeleteShiftEquipment"), {
                equipmentNumber: equipmentNumber,
                shiftId: fromShiftId
            }, function (deleteResponse) {
                if (deleteResponse.success) {
                    // Add to new shift with employee assignment
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doAddShiftEquipment"), {
                        employeeNumber: employeeNumber,
                        equipmentNumber: equipmentNumber,
                        shiftEquipmentNote: '',
                        shiftId: toShiftId
                    }, function (addResponse) {
                        if (addResponse.success) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Equipment has been moved and assigned to the employee.',
                                title: 'Equipment Assigned'
                            });
                            loadShifts();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: 'Failed to add equipment to shift.',
                                title: 'Error'
                            });
                        }
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to remove equipment from original shift.',
                        title: 'Error'
                    });
                }
            });
        }
    }
    // Event listeners
    shiftDateElement.addEventListener('change', loadShifts);
    viewModeElement.addEventListener('change', renderShifts);
    // Set up drag and drop event delegation on the results container
    resultsContainerElement.addEventListener('dragstart', handleDragStart);
    resultsContainerElement.addEventListener('dragend', handleDragEnd);
    resultsContainerElement.addEventListener('dragover', handleDragOver);
    resultsContainerElement.addEventListener('dragleave', handleDragLeave);
    resultsContainerElement.addEventListener('drop', handleDrop);
    // Set up drag and drop for available resources sidebar
    var availableResourcesContainer = document.querySelector('#container--availableResources');
    if (availableResourcesContainer !== null) {
        availableResourcesContainer.addEventListener('dragstart', handleDragStart);
        availableResourcesContainer.addEventListener('dragend', handleDragEnd);
        availableResourcesContainer.addEventListener('dragover', handleDragOver);
        availableResourcesContainer.addEventListener('dragleave', handleDragLeave);
        availableResourcesContainer.addEventListener('drop', handleDrop);
    }
    // Initialize flatpickr for date input
    if (flatpickr !== undefined) {
        flatpickr(shiftDateElement, {
            allowInput: true,
            dateFormat: 'Y-m-d',
            nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
            prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
        });
    }
    // Create shift modal
    function openCreateShiftModal() {
        var selectedDate = shiftDateElement.value;
        if (selectedDate === '') {
            bulmaJS.alert({
                contextualColorName: 'warning',
                message: 'Please select a date first.'
            });
            return;
        }
        var closeModalFunction;
        cityssm.openHtmlModal('shifts-createShift', {
            onshow: function (modalElement) {
                var formElement = modalElement.querySelector('#form--createShift');
                // Set the date
                var dateInput = formElement.querySelector('[name="shiftDateString"]');
                dateInput.value = selectedDate;
                var shiftTypeSelect = modalElement.querySelector('#createShift--shiftTypeDataListItemId');
                var shiftTimeSelect = modalElement.querySelector('#createShift--shiftTimeDataListItemId');
                var supervisorSelect = modalElement.querySelector('#createShift--supervisorEmployeeNumber');
                // Load shift types, times, and supervisors
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doGetShiftCreationData"), {}, function (rawResponseJSON) {
                    var responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        // Populate shift types
                        for (var _i = 0, _a = responseJSON.shiftTypes; _i < _a.length; _i++) {
                            var shiftType = _a[_i];
                            var optionElement = document.createElement('option');
                            optionElement.value = shiftType.dataListItemId.toString();
                            optionElement.textContent = shiftType.dataListItem;
                            shiftTypeSelect.append(optionElement);
                        }
                        // Populate shift times
                        for (var _b = 0, _c = responseJSON.shiftTimes; _b < _c.length; _b++) {
                            var shiftTime = _c[_b];
                            var optionElement = document.createElement('option');
                            optionElement.value = shiftTime.dataListItemId.toString();
                            optionElement.textContent = shiftTime.dataListItem;
                            shiftTimeSelect.append(optionElement);
                        }
                        // Populate supervisors
                        for (var _d = 0, _e = responseJSON.supervisors; _d < _e.length; _d++) {
                            var supervisor = _e[_d];
                            var optionElement = document.createElement('option');
                            optionElement.value = supervisor.employeeNumber;
                            optionElement.textContent = "".concat(supervisor.lastName, ", ").concat(supervisor.firstName);
                            supervisorSelect.append(optionElement);
                        }
                    }
                });
                // Handle form submission
                formElement.addEventListener('submit', function (submitEvent) {
                    submitEvent.preventDefault();
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/shifts/doCreateShift"), formElement, function (rawResponseJSON) {
                        var _a;
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Shift created successfully!'
                            });
                            closeModalFunction();
                            loadShifts();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : 'Failed to create shift.',
                                title: 'Creation Error'
                            });
                        }
                    });
                });
            },
            onshown: function (modalElement, closeFunction) {
                closeModalFunction = closeFunction;
            }
        });
    }
    // Create shift button handler
    var createShiftButton = document.querySelector('#button--createShift');
    if (createShiftButton !== null) {
        createShiftButton.addEventListener('click', openCreateShiftModal);
    }
    // Load shifts for today on page load
    loadShifts();
})();
