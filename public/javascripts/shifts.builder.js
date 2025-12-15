// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
(() => {
    const shiftLog = exports.shiftLog;
    const shiftDateElement = document.querySelector('#builder--shiftDate');
    const viewModeElement = document.querySelector('#builder--viewMode');
    const resultsContainerElement = document.querySelector('#container--shiftBuilderResults');
    let currentShifts = [];
    function getItemKey(type, id) {
        return `${type}:${id}`;
    }
    function findDuplicates(shifts) {
        const tracker = {};
        for (const shift of shifts) {
            // Track employees
            for (const employee of shift.employees) {
                const key = getItemKey('employee', employee.employeeNumber);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
            // Track equipment
            for (const equipment of shift.equipment) {
                const key = getItemKey('equipment', equipment.equipmentNumber);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
            // Track crews
            for (const crew of shift.crews) {
                const key = getItemKey('crew', crew.crewId);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
            // Track work orders
            for (const workOrder of shift.workOrders) {
                const key = getItemKey('workOrder', workOrder.workOrderId);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
        }
        // Remove items that only appear once
        for (const key in tracker) {
            if (tracker[key].length <= 1) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete tracker[key];
            }
        }
        return tracker;
    }
    function isDuplicate(duplicates, type, id) {
        const key = getItemKey(type, id);
        return duplicates[key] !== undefined;
    }
    function isShiftEditable(shift) {
        if (!shiftLog.canUpdate) {
            return false;
        }
        const shiftDate = new Date(shift.shiftDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return shiftDate >= today;
    }
    function wasUpdatedByOther(shift) {
        return (shift.recordUpdate_userName !== undefined &&
            shift.recordUpdate_userName !== shiftLog.currentUser &&
            shift.recordUpdate_userName !== shift.recordCreate_userName);
    }
    function renderEmployeesView(shift, duplicates) {
        const isEditable = isShiftEditable(shift);
        const containerElement = document.createElement('div');
        containerElement.className = 'shift-details';
        // Crews
        if (shift.crews.length > 0) {
            const crewsSection = document.createElement('div');
            crewsSection.className = 'mb-3';
            const crewsLabel = document.createElement('strong');
            crewsLabel.textContent = 'Crews:';
            crewsSection.append(crewsLabel);
            const crewsList = document.createElement('ul');
            crewsList.className = 'ml-4';
            for (const crew of shift.crews) {
                const isDup = isDuplicate(duplicates, 'crew', crew.crewId);
                const crewItem = document.createElement('li');
                if (isDup) {
                    crewItem.classList.add('has-background-warning-light');
                }
                if (isEditable) {
                    crewItem.classList.add('drop-target-crew');
                    crewItem.draggable = true;
                }
                crewItem.dataset.crewId = crew.crewId.toString();
                crewItem.textContent = crew.crewName;
                if (crew.shiftCrewNote !== '') {
                    const noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = ` - ${crew.shiftCrewNote}`;
                    crewItem.append(noteSpan);
                }
                crewsList.append(crewItem);
            }
            crewsSection.append(crewsList);
            containerElement.append(crewsSection);
        }
        // Employees
        if (shift.employees.length > 0) {
            const employeesSection = document.createElement('div');
            employeesSection.className = 'mb-3';
            const employeesLabel = document.createElement('strong');
            employeesLabel.textContent = 'Employees:';
            employeesSection.append(employeesLabel);
            const employeesList = document.createElement('ul');
            employeesList.className = 'ml-4';
            for (const employee of shift.employees) {
                const isDup = isDuplicate(duplicates, 'employee', employee.employeeNumber);
                const employeeItem = document.createElement('li');
                if (isDup) {
                    employeeItem.classList.add('has-background-warning-light');
                }
                if (isEditable) {
                    employeeItem.classList.add('drop-target-employee');
                    employeeItem.draggable = true;
                }
                employeeItem.dataset.employeeNumber = employee.employeeNumber;
                employeeItem.dataset.crewId = employee.crewId?.toString() ?? '';
                employeeItem.textContent = `${employee.lastName}, ${employee.firstName}`;
                if (employee.crewName !== null) {
                    const crewTag = document.createElement('span');
                    crewTag.className = 'tag is-small is-info is-light';
                    crewTag.textContent = employee.crewName;
                    employeeItem.append(' ', crewTag);
                }
                if (employee.shiftEmployeeNote !== '') {
                    const noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = ` - ${employee.shiftEmployeeNote}`;
                    employeeItem.append(noteSpan);
                }
                employeesList.append(employeeItem);
            }
            employeesSection.append(employeesList);
            containerElement.append(employeesSection);
        }
        // Equipment
        if (shift.equipment.length > 0) {
            const equipmentSection = document.createElement('div');
            equipmentSection.className = 'mb-3';
            const equipmentLabel = document.createElement('strong');
            equipmentLabel.textContent = 'Equipment:';
            equipmentSection.append(equipmentLabel);
            const equipmentList = document.createElement('ul');
            equipmentList.className = 'ml-4';
            for (const equipment of shift.equipment) {
                const isDup = isDuplicate(duplicates, 'equipment', equipment.equipmentNumber);
                const equipmentItem = document.createElement('li');
                if (isDup) {
                    equipmentItem.classList.add('has-background-warning-light');
                }
                if (isEditable) {
                    equipmentItem.draggable = true;
                }
                equipmentItem.dataset.equipmentNumber = equipment.equipmentNumber;
                equipmentItem.textContent = equipment.equipmentName;
                if (equipment.employeeFirstName !== null) {
                    const operatorSpan = document.createElement('span');
                    operatorSpan.className = 'has-text-grey-light';
                    operatorSpan.textContent = ` (${equipment.employeeLastName ?? ''}, ${equipment.employeeFirstName})`;
                    equipmentItem.append(operatorSpan);
                }
                if (equipment.shiftEquipmentNote !== '') {
                    const noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = ` - ${equipment.shiftEquipmentNote}`;
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
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'has-text-grey-light';
            emptyMessage.textContent = 'No employees or equipment assigned';
            containerElement.append(emptyMessage);
        }
        return containerElement;
    }
    function renderTasksView(shift, duplicates) {
        const isEditable = isShiftEditable(shift);
        const containerElement = document.createElement('div');
        containerElement.className = 'shift-details';
        if (shift.workOrders.length > 0) {
            const workOrdersSection = document.createElement('div');
            workOrdersSection.className = 'mb-3';
            const workOrdersLabel = document.createElement('strong');
            workOrdersLabel.textContent = 'Work Orders:';
            workOrdersSection.append(workOrdersLabel);
            const workOrdersList = document.createElement('ul');
            workOrdersList.className = 'ml-4';
            for (const workOrder of shift.workOrders) {
                const isDup = isDuplicate(duplicates, 'workOrder', workOrder.workOrderId);
                const workOrderItem = document.createElement('li');
                if (isDup) {
                    workOrderItem.classList.add('has-background-warning-light');
                }
                if (isEditable) {
                    workOrderItem.draggable = true;
                }
                workOrderItem.dataset.workorderId = workOrder.workOrderId.toString();
                const workOrderLink = document.createElement('a');
                workOrderLink.href = `${shiftLog.urlPrefix}/workOrders/${workOrder.workOrderId}`;
                workOrderLink.target = '_blank';
                workOrderLink.textContent = workOrder.workOrderNumber;
                workOrderItem.append(workOrderLink);
                if (workOrder.workOrderDetails !== '') {
                    workOrderItem.append(` - ${workOrder.workOrderDetails}`);
                }
                if (workOrder.shiftWorkOrderNote !== '') {
                    const noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = ` - ${workOrder.shiftWorkOrderNote}`;
                    workOrderItem.append(noteSpan);
                }
                workOrdersList.append(workOrderItem);
            }
            workOrdersSection.append(workOrdersList);
            containerElement.append(workOrdersSection);
        }
        else {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'has-text-grey-light';
            emptyMessage.textContent = 'No work orders assigned';
            containerElement.append(emptyMessage);
        }
        return containerElement;
    }
    function renderShiftCard(shift, duplicates, viewMode) {
        const cardElement = document.createElement('div');
        cardElement.className = 'column is-half-tablet is-one-third-desktop';
        cardElement.dataset.shiftId = shift.shiftId.toString();
        const updatedByOther = wasUpdatedByOther(shift);
        const isEditable = isShiftEditable(shift);
        const boxElement = document.createElement('div');
        boxElement.className = 'box';
        if (updatedByOther) {
            boxElement.classList.add('has-background-warning-light');
        }
        // Header
        const headerLevel = document.createElement('div');
        headerLevel.className = 'level is-mobile mb-3';
        const levelLeft = document.createElement('div');
        levelLeft.className = 'level-left';
        const levelLeftItem = document.createElement('div');
        levelLeftItem.className = 'level-item';
        const titleElement = document.createElement('h3');
        titleElement.className = 'title is-5 mb-0';
        const titleLink = document.createElement('a');
        titleLink.href = `${shiftLog.urlPrefix}/shifts/${shift.shiftId}`;
        titleLink.textContent = `#${shift.shiftId} - ${shift.shiftTypeDataListItem ?? 'Shift'}`;
        titleElement.append(titleLink);
        levelLeftItem.append(titleElement);
        levelLeft.append(levelLeftItem);
        headerLevel.append(levelLeft);
        const levelRight = document.createElement('div');
        levelRight.className = 'level-right';
        if (updatedByOther) {
            const warningItem = document.createElement('div');
            warningItem.className = 'level-item';
            const warningIcon = document.createElement('span');
            warningIcon.className = 'icon has-text-warning';
            warningIcon.title = 'Modified by another user';
            warningIcon.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i>';
            warningItem.append(warningIcon);
            levelRight.append(warningItem);
        }
        if (isEditable) {
            const editItem = document.createElement('div');
            editItem.className = 'level-item';
            const editLink = document.createElement('a');
            editLink.href = `${shiftLog.urlPrefix}/shifts/${shift.shiftId}/edit`;
            editLink.className = 'button is-small is-light';
            editLink.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>';
            editItem.append(editLink);
            levelRight.append(editItem);
        }
        headerLevel.append(levelRight);
        boxElement.append(headerLevel);
        // Shift details
        const contentElement = document.createElement('div');
        contentElement.className = 'content is-small';
        const timeParagraph = document.createElement('p');
        timeParagraph.className = 'mb-2';
        const timeLabel = document.createElement('strong');
        timeLabel.textContent = 'Time:';
        timeParagraph.append(timeLabel, ` ${shift.shiftTimeDataListItem ?? ''}`);
        contentElement.append(timeParagraph);
        // Make supervisor field a drop target for employees
        const supervisorParagraph = document.createElement('p');
        supervisorParagraph.className = 'mb-2';
        if (isEditable) {
            supervisorParagraph.classList.add('drop-target-supervisor');
        }
        supervisorParagraph.dataset.shiftId = shift.shiftId.toString();
        supervisorParagraph.dataset.supervisorEmployeeNumber = shift.supervisorEmployeeNumber;
        const supervisorLabel = document.createElement('strong');
        supervisorLabel.textContent = 'Supervisor:';
        supervisorParagraph.append(supervisorLabel, ` ${shift.supervisorLastName ?? ''}, ${shift.supervisorFirstName ?? ''}`);
        contentElement.append(supervisorParagraph);
        if (shift.shiftDescription !== '') {
            const descParagraph = document.createElement('p');
            descParagraph.className = 'mb-2';
            const descLabel = document.createElement('strong');
            descLabel.textContent = 'Description:';
            descParagraph.append(descLabel, ` ${shift.shiftDescription}`);
            contentElement.append(descParagraph);
        }
        boxElement.append(contentElement);
        const hrElement = document.createElement('hr');
        hrElement.className = 'my-3';
        boxElement.append(hrElement);
        // View-specific content
        const viewContent = viewMode === 'employees'
            ? renderEmployeesView(shift, duplicates)
            : renderTasksView(shift, duplicates);
        boxElement.append(viewContent);
        cardElement.append(boxElement);
        return cardElement;
    }
    function renderShifts() {
        resultsContainerElement.innerHTML = '';
        if (currentShifts.length === 0) {
            resultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <div class="message-body">
            No shifts found for the selected date.
          </div>
        </div>
      `;
            return;
        }
        const duplicates = findDuplicates(currentShifts);
        const viewMode = viewModeElement.value;
        const columnsElement = document.createElement('div');
        columnsElement.className = 'columns is-multiline';
        for (const shift of currentShifts) {
            const shiftCard = renderShiftCard(shift, duplicates, viewMode);
            columnsElement.append(shiftCard);
        }
        resultsContainerElement.append(columnsElement);
    }
    function loadShifts() {
        const shiftDateString = shiftDateElement.value;
        if (shiftDateString === '') {
            return;
        }
        cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doGetShiftsForBuilder`, {
            shiftDateString
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                currentShifts = responseJSON.shifts;
                renderShifts();
                loadAvailableResources();
            }
        });
    }
    function loadAvailableResources() {
        // Only load if the available resources sidebar exists (user has canUpdate permission)
        const availableResourcesContainer = document.querySelector('#container--availableResources');
        if (availableResourcesContainer === null) {
            return;
        }
        const shiftDateString = shiftDateElement.value;
        if (shiftDateString === '') {
            return;
        }
        cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doGetAvailableResources`, {
            shiftDateString
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderAvailableResources(responseJSON);
            }
        });
    }
    function renderAvailableResources(resources) {
        // Render employees
        const employeesList = document.querySelector('#available--employees .available-resources-list');
        if (employeesList !== null) {
            employeesList.textContent = '';
            if (resources.employees.length === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.className = 'has-text-grey-light is-size-7';
                emptyMessage.textContent = 'No available employees';
                employeesList.append(emptyMessage);
            }
            else {
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'available-items';
                for (const employee of resources.employees) {
                    const itemBox = document.createElement('div');
                    itemBox.className = 'box is-paddingless p-2 mb-2 is-clickable';
                    itemBox.draggable = true;
                    itemBox.dataset.employeeNumber = employee.employeeNumber;
                    itemBox.dataset.fromAvailable = 'true';
                    const itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = `${employee.lastName}, ${employee.firstName}`;
                    itemBox.append(itemText);
                    itemsContainer.append(itemBox);
                }
                employeesList.append(itemsContainer);
            }
        }
        // Render equipment
        const equipmentList = document.querySelector('#available--equipment .available-resources-list');
        if (equipmentList !== null) {
            equipmentList.textContent = '';
            if (resources.equipment.length === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.className = 'has-text-grey-light is-size-7';
                emptyMessage.textContent = 'No available equipment';
                equipmentList.append(emptyMessage);
            }
            else {
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'available-items';
                for (const equipment of resources.equipment) {
                    const itemBox = document.createElement('div');
                    itemBox.className = 'box is-paddingless p-2 mb-2 is-clickable';
                    itemBox.draggable = true;
                    itemBox.dataset.equipmentNumber = equipment.equipmentNumber;
                    itemBox.dataset.fromAvailable = 'true';
                    const itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = equipment.equipmentName;
                    itemBox.append(itemText);
                    itemsContainer.append(itemBox);
                }
                equipmentList.append(itemsContainer);
            }
        }
        // Render crews
        const crewsList = document.querySelector('#available--crews .available-resources-list');
        if (crewsList !== null) {
            crewsList.textContent = '';
            if (resources.crews.length === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.className = 'has-text-grey-light is-size-7';
                emptyMessage.textContent = 'No available crews';
                crewsList.append(emptyMessage);
            }
            else {
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'available-items';
                for (const crew of resources.crews) {
                    const itemBox = document.createElement('div');
                    itemBox.className = 'box is-paddingless p-2 mb-2 is-clickable';
                    itemBox.draggable = true;
                    itemBox.dataset.crewId = crew.crewId.toString();
                    itemBox.dataset.fromAvailable = 'true';
                    const itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = crew.crewName;
                    itemBox.append(itemText);
                    itemsContainer.append(itemBox);
                }
                crewsList.append(itemsContainer);
            }
        }
    }
    // Drag and drop state
    let draggedElement = null;
    let draggedData = null;
    // Drag and drop handlers
    function handleDragStart(event) {
        const target = event.target;
        draggedElement = target;
        target.classList.add('is-dragging');
        const employeeNumber = target.dataset.employeeNumber;
        const equipmentNumber = target.dataset.equipmentNumber;
        const crewId = target.dataset.crewId;
        const workorderId = target.dataset.workorderId;
        const fromAvailable = target.dataset.fromAvailable === 'true';
        const shiftCard = target.closest('[data-shift-id]');
        const fromShiftId = fromAvailable
            ? 0
            : Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
        if (employeeNumber !== undefined) {
            draggedData = {
                fromShiftId,
                id: employeeNumber,
                type: 'employee'
            };
        }
        else if (equipmentNumber !== undefined) {
            draggedData = {
                fromShiftId,
                id: equipmentNumber,
                type: 'equipment'
            };
        }
        else if (crewId !== undefined) {
            draggedData = {
                fromShiftId,
                id: Number.parseInt(crewId, 10),
                type: 'crew'
            };
        }
        else if (workorderId !== undefined) {
            draggedData = {
                fromShiftId,
                id: Number.parseInt(workorderId, 10),
                type: 'workOrder'
            };
        }
        if (event.dataTransfer !== null) {
            event.dataTransfer.effectAllowed = 'move';
        }
    }
    function handleDragEnd(event) {
        const target = event.target;
        target.classList.remove('is-dragging');
        draggedElement = null;
        draggedData = null;
        // Remove all drop zone highlights
        for (const element of document.querySelectorAll('.is-drop-target')) {
            element.classList.remove('is-drop-target');
        }
    }
    function handleDragOver(event) {
        event.preventDefault();
        const target = event.target;
        // Remove existing highlights
        for (const element of document.querySelectorAll('.is-drop-target')) {
            element.classList.remove('is-drop-target');
        }
        // Check if hovering over available resources sidebar (to remove from shift)
        const availableResourcesSidebar = target.closest('#container--availableResources');
        if (availableResourcesSidebar !== null &&
            draggedData !== null &&
            draggedData.fromShiftId > 0) {
            // Highlight the sidebar box when dragging from a shift to remove
            const sidebarBox = availableResourcesSidebar.querySelector('.box');
            if (sidebarBox !== null) {
                sidebarBox.classList.add('is-drop-target');
            }
            if (event.dataTransfer !== null) {
                event.dataTransfer.dropEffect = 'move';
            }
            return;
        }
        // Check for specific drop targets first
        const supervisorTarget = target.closest('.drop-target-supervisor');
        const crewTarget = target.closest('.drop-target-crew');
        const employeeTarget = target.closest('.drop-target-employee');
        // Highlight specific drop targets based on what's being dragged
        if (draggedData?.type === 'employee' && supervisorTarget !== null) {
            supervisorTarget.classList.add('is-drop-target');
        }
        else if (draggedData?.type === 'employee' && crewTarget !== null) {
            crewTarget.classList.add('is-drop-target');
        }
        else if (draggedData?.type === 'equipment' && employeeTarget !== null) {
            employeeTarget.classList.add('is-drop-target');
        }
        else {
            // Default: highlight entire shift box
            const shiftBox = target.closest('.box');
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
        const target = event.target;
        const shiftBox = target.closest('.box');
        if (shiftBox !== null) {
            shiftBox.classList.remove('is-drop-target');
        }
    }
    function handleDrop(event) {
        event.preventDefault();
        const target = event.target;
        target.classList.remove('is-drop-target');
        if (draggedData === null) {
            return;
        }
        // Check if dropped on available resources sidebar (to remove from shift)
        const availableResourcesSidebar = target.closest('#container--availableResources');
        if (availableResourcesSidebar !== null && draggedData.fromShiftId > 0) {
            removeFromShift(draggedData);
            return;
        }
        // Check for specific drop targets first
        const supervisorTarget = target.closest('.drop-target-supervisor');
        const crewTarget = target.closest('.drop-target-crew');
        const employeeTarget = target.closest('.drop-target-employee');
        // Handle employee dropped on supervisor slot
        if (supervisorTarget !== null && draggedData.type === 'employee') {
            const shiftId = Number.parseInt(supervisorTarget.dataset.shiftId ?? '0', 10);
            if (shiftId > 0) {
                makeEmployeeSupervisor(draggedData.id, shiftId);
                return;
            }
        }
        // Handle employee dropped on crew
        if (crewTarget !== null && draggedData.type === 'employee') {
            const shiftCard = crewTarget.closest('[data-shift-id]');
            const shiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
            const crewId = Number.parseInt(crewTarget.dataset.crewId ?? '0', 10);
            if (shiftId > 0 && crewId > 0) {
                assignEmployeeToCrew(draggedData.id, draggedData.fromShiftId, shiftId, crewId);
                return;
            }
        }
        // Handle equipment dropped on employee
        if (employeeTarget !== null && draggedData.type === 'equipment') {
            const shiftCard = employeeTarget.closest('[data-shift-id]');
            const shiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
            const employeeNumber = employeeTarget.dataset.employeeNumber ?? '';
            if (shiftId > 0 && employeeNumber !== '') {
                assignEquipmentToEmployee(draggedData.id, draggedData.fromShiftId, shiftId, employeeNumber);
                return;
            }
        }
        // Default: move to shift
        const shiftCard = target.closest('[data-shift-id]');
        const toShiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
        if (toShiftId === 0 || toShiftId === draggedData.fromShiftId) {
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
                cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftCrew`, {
                    crewId: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, (response) => {
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
                cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftEmployee`, {
                    employeeNumber: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, (response) => {
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
                cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftEquipment`, {
                    equipmentNumber: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, (response) => {
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
            cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftEmployee`, {
                employeeNumber,
                shiftEmployeeNote: '',
                shiftId: toShiftId
            }, (addResponse) => {
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
        cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftEmployee`, {
            employeeNumber,
            shiftId: fromShiftId
        }, (deleteResponse) => {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftEmployee`, {
                    employeeNumber,
                    shiftEmployeeNote: '',
                    shiftId: toShiftId
                }, (addResponse) => {
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
            cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftEquipment`, {
                equipmentNumber,
                shiftEquipmentNote: '',
                shiftId: toShiftId
            }, (addResponse) => {
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
        cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftEquipment`, {
            equipmentNumber,
            shiftId: fromShiftId
        }, (deleteResponse) => {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftEquipment`, {
                    equipmentNumber,
                    shiftEquipmentNote: '',
                    shiftId: toShiftId
                }, (addResponse) => {
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
            cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftCrew`, {
                crewId,
                shiftCrewNote: '',
                shiftId: toShiftId
            }, (addResponse) => {
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
        cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftCrew`, {
            crewId,
            shiftId: fromShiftId
        }, (deleteResponse) => {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftCrew`, {
                    crewId,
                    shiftCrewNote: '',
                    shiftId: toShiftId
                }, (addResponse) => {
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
        cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftWorkOrder`, {
            shiftId: fromShiftId,
            workOrderId
        }, (deleteResponse) => {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftWorkOrder`, {
                    shiftId: toShiftId,
                    shiftWorkOrderNote: '',
                    workOrderId
                }, (addResponse) => {
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
        const shift = currentShifts.find((s) => s.shiftId === shiftId);
        if (shift === undefined) {
            return;
        }
        cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doUpdateShift`, {
            shiftDateString: shift.shiftDate,
            shiftDescription: shift.shiftDescription,
            shiftId,
            shiftTimeDataListItemId: shift.shiftTimeDataListItemId,
            shiftTypeDataListItemId: shift.shiftTypeDataListItemId,
            supervisorEmployeeNumber: employeeNumber
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
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
            cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doUpdateShiftEmployee`, {
                crewId,
                employeeNumber,
                shiftId: toShiftId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
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
            cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftEmployee`, {
                employeeNumber,
                shiftId: fromShiftId
            }, (deleteResponse) => {
                if (deleteResponse.success) {
                    // Add to new shift with crew assignment
                    cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftEmployee`, {
                        crewId,
                        employeeNumber,
                        shiftEmployeeNote: '',
                        shiftId: toShiftId
                    }, (addResponse) => {
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
            cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doUpdateShiftEquipment`, {
                employeeNumber,
                equipmentNumber,
                shiftId: toShiftId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
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
            cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doDeleteShiftEquipment`, {
                equipmentNumber,
                shiftId: fromShiftId
            }, (deleteResponse) => {
                if (deleteResponse.success) {
                    // Add to new shift with employee assignment
                    cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doAddShiftEquipment`, {
                        employeeNumber,
                        equipmentNumber,
                        shiftEquipmentNote: '',
                        shiftId: toShiftId
                    }, (addResponse) => {
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
    const availableResourcesContainer = document.querySelector('#container--availableResources');
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
        const selectedDate = shiftDateElement.value;
        if (selectedDate === '') {
            bulmaJS.alert({
                contextualColorName: 'warning',
                message: 'Please select a date first.'
            });
            return;
        }
        let closeModalFunction;
        cityssm.openHtmlModal('shifts-createShift', {
            onshow(modalElement) {
                const formElement = modalElement.querySelector('#form--createShift');
                // Set the date
                const dateInput = formElement.querySelector('[name="shiftDateString"]');
                dateInput.value = selectedDate;
                const shiftTypeSelect = modalElement.querySelector('#createShift--shiftTypeDataListItemId');
                const shiftTimeSelect = modalElement.querySelector('#createShift--shiftTimeDataListItemId');
                const supervisorSelect = modalElement.querySelector('#createShift--supervisorEmployeeNumber');
                // Load shift types, times, and supervisors
                cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doGetShiftCreationData`, {}, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        // Populate shift types
                        for (const shiftType of responseJSON.shiftTypes) {
                            const optionElement = document.createElement('option');
                            optionElement.value = shiftType.dataListItemId.toString();
                            optionElement.textContent = shiftType.dataListItem;
                            shiftTypeSelect.append(optionElement);
                        }
                        // Populate shift times
                        for (const shiftTime of responseJSON.shiftTimes) {
                            const optionElement = document.createElement('option');
                            optionElement.value = shiftTime.dataListItemId.toString();
                            optionElement.textContent = shiftTime.dataListItem;
                            shiftTimeSelect.append(optionElement);
                        }
                        // Populate supervisors
                        for (const supervisor of responseJSON.supervisors) {
                            const optionElement = document.createElement('option');
                            optionElement.value = supervisor.employeeNumber;
                            optionElement.textContent = `${supervisor.lastName}, ${supervisor.firstName}`;
                            supervisorSelect.append(optionElement);
                        }
                    }
                });
                // Handle form submission
                formElement.addEventListener('submit', (submitEvent) => {
                    submitEvent.preventDefault();
                    cityssm.postJSON(`${shiftLog.urlPrefix}/shifts/doCreateShift`, formElement, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
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
                                message: responseJSON.errorMessage ?? 'Failed to create shift.',
                                title: 'Creation Error'
                            });
                        }
                    });
                });
            },
            onshown(modalElement, closeFunction) {
                closeModalFunction = closeFunction;
            }
        });
    }
    // Create shift button handler
    const createShiftButton = document.querySelector('#button--createShift');
    if (createShiftButton !== null) {
        createShiftButton.addEventListener('click', openCreateShiftModal);
    }
    // Load shifts for today on page load
    loadShifts();
})();
