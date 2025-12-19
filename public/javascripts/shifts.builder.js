// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines, unicorn/no-null */
(() => {
    const shiftLog = exports.shiftLog;
    const shiftUrlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`;
    const shiftDateElement = document.querySelector('#builder--shiftDate');
    const viewModeElement = document.querySelector('#builder--viewMode');
    const resultsContainerElement = document.querySelector('#container--shiftBuilderResults');
    let currentShifts = [];
    // Track locked shifts
    const lockedShifts = new Set();
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
        const isLocked = lockedShifts.has(shift.shiftId);
        const isDraggable = isEditable && !isLocked;
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
                }
                if (isDraggable) {
                    crewItem.draggable = true;
                }
                crewItem.dataset.crewId = crew.crewId.toString();
                // Add icon
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-users"></i>';
                crewItem.append(icon, ' ');
                // Add crew name
                const nameSpan = document.createElement('span');
                nameSpan.textContent = crew.crewName;
                crewItem.append(nameSpan);
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
                }
                if (isDraggable) {
                    employeeItem.draggable = true;
                }
                employeeItem.dataset.employeeNumber = employee.employeeNumber;
                employeeItem.dataset.crewId = employee.crewId?.toString() ?? '';
                // Add icon
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-user"></i>';
                employeeItem.append(icon, ' ');
                // Add employee name with number in smaller text
                const nameSpan = document.createElement('span');
                nameSpan.textContent = `${employee.lastName}, ${employee.firstName} `;
                employeeItem.append(nameSpan);
                const numberSpan = document.createElement('span');
                numberSpan.className = 'is-size-7 has-text-grey';
                numberSpan.textContent = `(#${employee.employeeNumber})`;
                employeeItem.append(numberSpan);
                if (employee.crewName !== null) {
                    const crewTag = document.createElement('span');
                    crewTag.className = 'tag is-small is-info is-light ml-1';
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
                if (isDraggable) {
                    equipmentItem.draggable = true;
                }
                equipmentItem.dataset.equipmentNumber = equipment.equipmentNumber;
                // Add icon
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-truck"></i>';
                equipmentItem.append(icon, ' ');
                // Add equipment name with number in smaller text
                const nameSpan = document.createElement('span');
                nameSpan.textContent = `${equipment.equipmentName} `;
                equipmentItem.append(nameSpan);
                const numberSpan = document.createElement('span');
                numberSpan.className = 'is-size-7 has-text-grey';
                numberSpan.textContent = `(#${equipment.equipmentNumber})`;
                equipmentItem.append(numberSpan);
                if (equipment.employeeFirstName !== null) {
                    const operatorTag = document.createElement('span');
                    operatorTag.className = 'tag is-small is-info is-light ml-1';
                    operatorTag.textContent = `${equipment.employeeLastName ?? ''}, ${equipment.employeeFirstName}`;
                    equipmentItem.append(' ', operatorTag);
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
        const isLocked = lockedShifts.has(shift.shiftId);
        const isDraggable = isEditable && !isLocked;
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
                if (isDraggable) {
                    workOrderItem.draggable = true;
                }
                workOrderItem.dataset.workOrderId = workOrder.workOrderId.toString();
                // Add icon
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-clipboard-list"></i>';
                workOrderItem.append(icon, ' ');
                // Add work order link
                const workOrderLink = document.createElement('a');
                workOrderLink.href = shiftLog.buildWorkOrderURL(workOrder.workOrderId);
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
        // Lock button (if editable)
        if (isEditable) {
            const lockItem = document.createElement('div');
            lockItem.className = 'level-item';
            const lockButton = document.createElement('button');
            lockButton.className = 'button is-small is-ghost';
            lockButton.type = 'button';
            lockButton.title = 'Lock/Unlock shift';
            lockButton.dataset.shiftId = shift.shiftId.toString();
            const isLocked = lockedShifts.has(shift.shiftId);
            const lockIcon = document.createElement('span');
            lockIcon.className = 'icon is-small';
            lockIcon.innerHTML = isLocked
                ? '<i class="fa-solid fa-lock has-text-danger"></i>'
                : '<i class="fa-solid fa-lock-open has-text-success"></i>';
            lockButton.append(lockIcon);
            lockButton.addEventListener('click', () => {
                toggleShiftLock(shift.shiftId);
            });
            lockItem.append(lockButton);
            levelLeft.append(lockItem);
        }
        const levelLeftItem = document.createElement('div');
        levelLeftItem.className = 'level-item';
        const titleElement = document.createElement('h3');
        titleElement.className = 'title is-5 mb-0';
        const titleLink = document.createElement('a');
        titleLink.href = shiftLog.buildShiftURL(shift.shiftId);
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
            editLink.href = shiftLog.buildShiftURL(shift.shiftId, true);
            editLink.className = 'button is-small is-light';
            editLink.innerHTML =
                '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>';
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
        supervisorParagraph.dataset.supervisorEmployeeNumber =
            shift.supervisorEmployeeNumber;
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
        // Add Resource button (only for editable shifts that are not locked)
        if (isEditable && !lockedShifts.has(shift.shiftId)) {
            const addResourceButton = document.createElement('button');
            addResourceButton.className =
                'button is-small is-success is-fullwidth mt-3';
            addResourceButton.type = 'button';
            addResourceButton.innerHTML =
                '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span><span>Add Resource</span>';
            addResourceButton.addEventListener('click', () => {
                openAddResourceModal(shift, viewMode);
            });
            boxElement.append(addResourceButton);
        }
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
        cityssm.postJSON(`${shiftUrlPrefix}/doGetShiftsForBuilder`, {
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
        cityssm.postJSON(`${shiftUrlPrefix}/doGetAvailableResources`, {
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
                    itemBox.className = 'box p-2 mb-2';
                    itemBox.draggable = true;
                    itemBox.dataset.employeeNumber = employee.employeeNumber;
                    itemBox.dataset.fromAvailable = 'true';
                    itemBox.dataset.isSupervisor = employee.isSupervisor.toString();
                    // Add icon
                    const icon = document.createElement('span');
                    icon.className = 'icon';
                    icon.innerHTML = '<i class="fa-solid fa-user"></i>';
                    itemBox.append(icon, ' ');
                    // Add employee name with number
                    const itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = `${employee.lastName}, ${employee.firstName} `;
                    itemBox.append(itemText);
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'is-size-7 has-text-grey';
                    numberSpan.textContent = `(#${employee.employeeNumber})`;
                    itemBox.append(numberSpan);
                    itemsContainer.append(itemBox);
                }
                employeesList.append(itemsContainer);
            }
        }
        // Update employees count
        const employeesCountTag = document.querySelector('#employees-count');
        if (employeesCountTag !== null) {
            employeesCountTag.textContent = resources.employees.length.toString();
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
                    itemBox.className = 'box p-2 mb-2';
                    itemBox.draggable = true;
                    itemBox.dataset.equipmentNumber = equipment.equipmentNumber;
                    itemBox.dataset.fromAvailable = 'true';
                    // Add icon
                    const icon = document.createElement('span');
                    icon.className = 'icon';
                    icon.innerHTML = '<i class="fa-solid fa-truck"></i>';
                    itemBox.append(icon, ' ');
                    // Add equipment name with number
                    const itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = `${equipment.equipmentName} `;
                    itemBox.append(itemText);
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'is-size-7 has-text-grey';
                    numberSpan.textContent = `(#${equipment.equipmentNumber})`;
                    itemBox.append(numberSpan);
                    itemsContainer.append(itemBox);
                }
                equipmentList.append(itemsContainer);
            }
        }
        // Update equipment count
        const equipmentCountTag = document.querySelector('#equipment-count');
        if (equipmentCountTag !== null) {
            equipmentCountTag.textContent = resources.equipment.length.toString();
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
                    itemBox.className = 'box p-2 mb-2';
                    itemBox.draggable = true;
                    itemBox.dataset.crewId = crew.crewId.toString();
                    itemBox.dataset.fromAvailable = 'true';
                    // Add icon
                    const icon = document.createElement('span');
                    icon.className = 'icon';
                    icon.innerHTML = '<i class="fa-solid fa-users"></i>';
                    itemBox.append(icon, ' ');
                    // Add crew name
                    const itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = crew.crewName;
                    itemBox.append(itemText);
                    itemsContainer.append(itemBox);
                }
                crewsList.append(itemsContainer);
            }
        }
        // Update crews count
        const crewsCountTag = document.querySelector('#crews-count');
        if (crewsCountTag !== null) {
            crewsCountTag.textContent = resources.crews.length.toString();
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
    let draggedElement = null;
    let draggedData = null;
    // Drag and drop handlers
    function handleDragStart(event) {
        const target = event.target;
        const employeeNumber = target.dataset.employeeNumber;
        const equipmentNumber = target.dataset.equipmentNumber;
        const crewId = target.dataset.crewId;
        const workOrderId = target.dataset.workOrderId;
        const fromAvailable = target.dataset.fromAvailable === 'true';
        const shiftCard = target.closest('[data-shift-id]');
        const fromShiftId = fromAvailable
            ? 0
            : Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
        // Prevent dragging from locked shifts
        if (fromShiftId !== 0 && lockedShifts.has(fromShiftId)) {
            event.preventDefault();
            return;
        }
        draggedElement = target;
        target.classList.add('is-dragging');
        if (employeeNumber !== undefined) {
            // Get isSupervisor status
            let isSupervisor = false;
            // Check if it's from available resources
            if (fromAvailable && target.dataset.isSupervisor !== undefined) {
                isSupervisor = target.dataset.isSupervisor === 'true';
            }
            else if (!fromAvailable) {
                // Check in current shifts
                for (const shift of currentShifts) {
                    const employee = shift.employees.find((potentialEmployee) => potentialEmployee.employeeNumber === employeeNumber);
                    if (employee !== undefined) {
                        isSupervisor = employee.isSupervisor;
                        break;
                    }
                }
            }
            draggedData = {
                fromShiftId,
                id: employeeNumber,
                type: 'employee',
                isSupervisor
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
        else if (workOrderId !== undefined) {
            draggedData = {
                fromShiftId,
                id: Number.parseInt(workOrderId, 10),
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
            const targetShift = currentShifts.find((s) => s.shiftId === shiftId);
            const employeeNumber = draggedData.id;
            const isSupervisor = draggedData.isSupervisor ?? false;
            // Prevent dropping on locked shifts, past date shifts, or non-supervisors
            if (shiftId > 0 &&
                !lockedShifts.has(shiftId) &&
                targetShift !== undefined &&
                isShiftEditable(targetShift)) {
                if (!isSupervisor) {
                    bulmaJS.alert({
                        contextualColorName: 'warning',
                        message: 'Only employees marked as supervisors can be assigned to the supervisor position.',
                        title: 'Invalid Assignment'
                    });
                    return;
                }
                makeEmployeeSupervisor(employeeNumber, shiftId);
                return;
            }
        }
        // Handle employee dropped on crew
        if (crewTarget !== null && draggedData.type === 'employee') {
            const shiftCard = crewTarget.closest('[data-shift-id]');
            const shiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
            const crewId = Number.parseInt(crewTarget.dataset.crewId ?? '0', 10);
            const targetShift = currentShifts.find((s) => s.shiftId === shiftId);
            // Prevent dropping on locked shifts or past date shifts
            if (shiftId > 0 &&
                crewId > 0 &&
                !lockedShifts.has(shiftId) &&
                targetShift !== undefined &&
                isShiftEditable(targetShift)) {
                assignEmployeeToCrew(draggedData.id, draggedData.fromShiftId, shiftId, crewId);
                return;
            }
        }
        // Handle equipment dropped on employee
        if (employeeTarget !== null && draggedData.type === 'equipment') {
            const shiftCard = employeeTarget.closest('[data-shift-id]');
            const shiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
            const employeeNumber = employeeTarget.dataset.employeeNumber ?? '';
            const targetShift = currentShifts.find((s) => s.shiftId === shiftId);
            // Prevent dropping on locked shifts or past date shifts
            if (shiftId > 0 &&
                employeeNumber !== '' &&
                !lockedShifts.has(shiftId) &&
                targetShift !== undefined &&
                isShiftEditable(targetShift)) {
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
        // Prevent dropping on locked shifts
        if (lockedShifts.has(toShiftId)) {
            return;
        }
        // Prevent dropping on past date shifts
        const targetShift = currentShifts.find((s) => s.shiftId === toShiftId);
        if (targetShift !== undefined && !isShiftEditable(targetShift)) {
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
        }
    }
    // Helper function to get equipment assigned to an employee
    function getEmployeeEquipment(shiftId, employeeNumber) {
        const shift = currentShifts.find((s) => s.shiftId === shiftId);
        if (shift === undefined) {
            return [];
        }
        return shift.equipment
            .filter((eq) => eq.employeeNumber === employeeNumber)
            .map((eq) => ({
            equipmentNumber: eq.equipmentNumber,
            equipmentName: eq.equipmentName
        }));
    }
    // Helper function to get employees assigned to a crew
    function getCrewEmployees(shiftId, crewId) {
        const shift = currentShifts.find((s) => s.shiftId === shiftId);
        if (shift === undefined) {
            return [];
        }
        return shift.employees
            .filter((emp) => emp.crewId === crewId)
            .map((emp) => ({
            employeeNumber: emp.employeeNumber,
            firstName: emp.firstName,
            lastName: emp.lastName
        }));
    }
    function removeFromShift(draggedData) {
        switch (draggedData.type) {
            case 'crew': {
                // Get employees assigned to this crew
                const crewEmployees = getCrewEmployees(draggedData.fromShiftId, draggedData.id);
                // Get equipment for each employee in the crew
                const crewEquipment = [];
                for (const employee of crewEmployees) {
                    const employeeEquipment = getEmployeeEquipment(draggedData.fromShiftId, employee.employeeNumber);
                    for (const equipment of employeeEquipment) {
                        crewEquipment.push({
                            employeeNumber: employee.employeeNumber,
                            equipmentNumber: equipment.equipmentNumber,
                            equipmentName: equipment.equipmentName
                        });
                    }
                }
                // Delete crew first
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftCrew`, {
                    crewId: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, (response) => {
                    if (response.success) {
                        // Also delete crew employees and their equipment
                        let employeesDeletedCount = 0;
                        let employeesFailedCount = 0;
                        let equipmentDeletedCount = 0;
                        let equipmentFailedCount = 0;
                        const totalEmployees = crewEmployees.length;
                        const totalEquipment = crewEquipment.length;
                        if (totalEmployees === 0) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Crew removed from shift.'
                            });
                            loadShifts();
                        }
                        else {
                            // Delete each crew employee
                            for (const employee of crewEmployees) {
                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
                                    employeeNumber: employee.employeeNumber,
                                    shiftId: draggedData.fromShiftId
                                }, (empResponse) => {
                                    if (empResponse.success) {
                                        employeesDeletedCount += 1;
                                    }
                                    else {
                                        employeesFailedCount += 1;
                                    }
                                    // Check if all employees processed
                                    if (employeesDeletedCount + employeesFailedCount ===
                                        totalEmployees) {
                                        // Now delete equipment
                                        if (totalEquipment === 0) {
                                            // No equipment to delete, show final message
                                            if (employeesFailedCount === 0) {
                                                bulmaJS.alert({
                                                    contextualColorName: 'success',
                                                    message: `Crew and ${totalEmployees} associated employee(s) removed from shift.`
                                                });
                                            }
                                            else {
                                                bulmaJS.alert({
                                                    contextualColorName: 'warning',
                                                    message: `Crew removed. ${employeesDeletedCount} employee(s) removed, but ${employeesFailedCount} employee(s) failed to remove.`,
                                                    title: 'Partial Success'
                                                });
                                            }
                                            loadShifts();
                                        }
                                        else {
                                            // Delete equipment
                                            for (const equipment of crewEquipment) {
                                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                                                    equipmentNumber: equipment.equipmentNumber,
                                                    shiftId: draggedData.fromShiftId
                                                }, (eqResponse) => {
                                                    if (eqResponse.success) {
                                                        equipmentDeletedCount += 1;
                                                    }
                                                    else {
                                                        equipmentFailedCount += 1;
                                                    }
                                                    // Check if all equipment processed
                                                    if (equipmentDeletedCount +
                                                        equipmentFailedCount ===
                                                        totalEquipment) {
                                                        // Show final message
                                                        if (employeesFailedCount === 0 &&
                                                            equipmentFailedCount === 0) {
                                                            bulmaJS.alert({
                                                                contextualColorName: 'success',
                                                                message: `Crew, ${totalEmployees} employee(s), and ${totalEquipment} equipment removed from shift.`
                                                            });
                                                        }
                                                        else {
                                                            bulmaJS.alert({
                                                                contextualColorName: 'warning',
                                                                message: `Crew removed. ${employeesDeletedCount} of ${totalEmployees} employee(s) and ${equipmentDeletedCount} of ${totalEquipment} equipment removed successfully.`,
                                                                title: 'Partial Success'
                                                            });
                                                        }
                                                        loadShifts();
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
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
                // Get equipment assigned to this employee
                const assignedEquipment = getEmployeeEquipment(draggedData.fromShiftId, draggedData.id);
                // Delete employee first
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
                    employeeNumber: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, (response) => {
                    if (response.success) {
                        // Also delete assigned equipment
                        let equipmentDeletedCount = 0;
                        const totalEquipment = assignedEquipment.length;
                        if (totalEquipment === 0) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Employee removed from shift.'
                            });
                            loadShifts();
                        }
                        else {
                            // Delete each piece of equipment
                            for (const equipment of assignedEquipment) {
                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                                    equipmentNumber: equipment.equipmentNumber,
                                    shiftId: draggedData.fromShiftId
                                }, (equipResponse) => {
                                    equipmentDeletedCount += 1;
                                    if (equipmentDeletedCount === totalEquipment) {
                                        bulmaJS.alert({
                                            contextualColorName: 'success',
                                            message: `Employee and ${totalEquipment} assigned equipment removed from shift.`
                                        });
                                        loadShifts();
                                    }
                                });
                            }
                        }
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
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
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
                            title: 'Error',
                            message: 'Failed to remove equipment from shift.'
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
            cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
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
        // Get equipment assigned to this employee
        const assignedEquipment = getEmployeeEquipment(fromShiftId, employeeNumber);
        // Delete from old shift
        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
            employeeNumber,
            shiftId: fromShiftId
        }, (deleteResponse) => {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
                    employeeNumber,
                    shiftEmployeeNote: '',
                    shiftId: toShiftId
                }, (addResponse) => {
                    if (addResponse.success) {
                        // Move assigned equipment too
                        let equipmentMovedCount = 0;
                        const totalEquipment = assignedEquipment.length;
                        if (totalEquipment === 0) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Employee has been moved to the new shift.',
                                title: 'Employee Moved'
                            });
                            loadShifts();
                        }
                        else {
                            // First delete equipment from old shift
                            for (const equipment of assignedEquipment) {
                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                                    equipmentNumber: equipment.equipmentNumber,
                                    shiftId: fromShiftId
                                }, (deleteEquipResponse) => {
                                    if (deleteEquipResponse.success) {
                                        // Add equipment to new shift with operator assignment
                                        cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                                            equipmentNumber: equipment.equipmentNumber,
                                            employeeNumber,
                                            shiftEquipmentNote: '',
                                            shiftId: toShiftId
                                        }, () => {
                                            equipmentMovedCount += 1;
                                            if (equipmentMovedCount === totalEquipment) {
                                                bulmaJS.alert({
                                                    contextualColorName: 'success',
                                                    title: 'Employee Moved',
                                                    message: `Employee and ${totalEquipment} assigned equipment moved to new shift.`
                                                });
                                                loadShifts();
                                            }
                                        });
                                    }
                                });
                            }
                        }
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
            cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                equipmentNumber,
                shiftEquipmentNote: '',
                shiftId: toShiftId
            }, (addResponse) => {
                if (addResponse.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Equipment Added',
                        message: 'Equipment has been added to the shift.'
                    });
                    loadShifts();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: addResponse.message ?? 'Failed to add equipment to shift.',
                        title: 'Error'
                    });
                }
            });
            return;
        }
        // Delete from old shift
        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
            equipmentNumber,
            shiftId: fromShiftId
        }, (deleteResponse) => {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                    equipmentNumber,
                    shiftEquipmentNote: '',
                    shiftId: toShiftId
                }, (addResponse) => {
                    if (addResponse.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            title: 'Equipment Moved',
                            message: 'Equipment has been moved to the new shift.'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: addResponse.message ??
                                'Failed to add equipment to new shift.',
                            title: 'Error'
                        });
                    }
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error',
                    message: 'Failed to remove equipment from original shift.'
                });
            }
        });
    }
    function moveCrew(crewId, fromShiftId, toShiftId) {
        // If fromShiftId is 0, crew is from available resources
        if (fromShiftId === 0) {
            // Just add to new shift
            cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftCrew`, {
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
        // Get employees assigned to this crew
        const crewEmployees = getCrewEmployees(fromShiftId, crewId);
        // Get equipment for each employee in the crew
        const crewEquipment = [];
        for (const employee of crewEmployees) {
            const employeeEquipment = getEmployeeEquipment(fromShiftId, employee.employeeNumber);
            for (const equipment of employeeEquipment) {
                crewEquipment.push({
                    employeeNumber: employee.employeeNumber,
                    equipmentNumber: equipment.equipmentNumber,
                    equipmentName: equipment.equipmentName
                });
            }
        }
        // Delete crew from old shift
        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftCrew`, {
            crewId,
            shiftId: fromShiftId
        }, (deleteResponse) => {
            if (deleteResponse.success) {
                // Add crew to new shift
                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftCrew`, {
                    crewId,
                    shiftCrewNote: '',
                    shiftId: toShiftId
                }, (addResponse) => {
                    if (addResponse.success) {
                        // Now move employees
                        let employeesProcessed = 0;
                        const totalEmployees = crewEmployees.length;
                        if (totalEmployees === 0) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Crew has been moved to the new shift.',
                                title: 'Crew Moved'
                            });
                            loadShifts();
                        }
                        else {
                            // Delete and add each employee
                            for (const employee of crewEmployees) {
                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
                                    employeeNumber: employee.employeeNumber,
                                    shiftId: fromShiftId
                                }, (deleteEmpResponse) => {
                                    if (deleteEmpResponse.success) {
                                        // Add employee to new shift with crew assignment
                                        cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
                                            crewId,
                                            employeeNumber: employee.employeeNumber,
                                            shiftEmployeeNote: '',
                                            shiftId: toShiftId
                                        }, () => {
                                            employeesProcessed += 1;
                                            // Check if all employees are processed
                                            if (employeesProcessed === totalEmployees) {
                                                // Now move equipment
                                                let equipmentProcessed = 0;
                                                const totalEquipment = crewEquipment.length;
                                                if (totalEquipment === 0) {
                                                    bulmaJS.alert({
                                                        contextualColorName: 'success',
                                                        message: `Crew and ${totalEmployees} employee(s) moved to new shift.`,
                                                        title: 'Crew Moved'
                                                    });
                                                    loadShifts();
                                                }
                                                else {
                                                    // Delete and add each equipment
                                                    for (const equipment of crewEquipment) {
                                                        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                                                            equipmentNumber: equipment.equipmentNumber,
                                                            shiftId: fromShiftId
                                                        }, (deleteEqResponse) => {
                                                            if (deleteEqResponse.success) {
                                                                // Add equipment to new shift with operator assignment
                                                                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                                                                    employeeNumber: equipment.employeeNumber,
                                                                    equipmentNumber: equipment.equipmentNumber,
                                                                    shiftEquipmentNote: '',
                                                                    shiftId: toShiftId
                                                                }, () => {
                                                                    equipmentProcessed += 1;
                                                                    if (equipmentProcessed ===
                                                                        totalEquipment) {
                                                                        bulmaJS.alert({
                                                                            contextualColorName: 'success',
                                                                            message: `Crew, ${totalEmployees} employee(s), and ${totalEquipment} equipment moved to new shift.`,
                                                                            title: 'Crew Moved'
                                                                        });
                                                                        loadShifts();
                                                                    }
                                                                });
                                                            }
                                                            else {
                                                                equipmentProcessed += 1;
                                                                if (equipmentProcessed ===
                                                                    totalEquipment) {
                                                                    bulmaJS.alert({
                                                                        contextualColorName: 'success',
                                                                        message: `Crew and ${totalEmployees} employee(s) moved to new shift. Some equipment may not have been moved.`,
                                                                        title: 'Crew Moved'
                                                                    });
                                                                    loadShifts();
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        employeesProcessed += 1;
                                        if (employeesProcessed === totalEmployees) {
                                            bulmaJS.alert({
                                                contextualColorName: 'warning',
                                                message: 'Crew moved but some employees may not have been moved.',
                                                title: 'Crew Moved'
                                            });
                                            loadShifts();
                                        }
                                    }
                                });
                            }
                        }
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
        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftWorkOrder`, {
            shiftId: fromShiftId,
            workOrderId
        }, (deleteResponse) => {
            if (deleteResponse.success) {
                // Add to new shift
                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftWorkOrder`, {
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
        cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShift`, {
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
            cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShiftEmployee`, {
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
            cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
                employeeNumber,
                shiftId: fromShiftId
            }, (deleteResponse) => {
                if (deleteResponse.success) {
                    // Add to new shift with crew assignment
                    cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
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
            cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShiftEquipment`, {
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
                        message: responseJSON.message ??
                            'Failed to assign equipment to employee.',
                        title: 'Error'
                    });
                }
            });
        }
        else {
            cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                equipmentNumber,
                shiftId: fromShiftId
            }, (deleteResponse) => {
                if (deleteResponse.success) {
                    // Add to new shift with employee assignment
                    cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
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
                                message: addResponse.message ??
                                    'Failed to add equipment to shift.',
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
                cityssm.postJSON(`${shiftUrlPrefix}/doGetShiftCreationData`, {}, (rawResponseJSON) => {
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
                    cityssm.postJSON(`${shiftUrlPrefix}/doCreateShift`, formElement, (rawResponseJSON) => {
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
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    // Create shift button handler
    const createShiftButton = document.querySelector('#button--createShift');
    if (createShiftButton !== null) {
        createShiftButton.addEventListener('click', openCreateShiftModal);
    }
    // Add Resource Modal
    function openAddResourceModal(shift, viewMode) {
        cityssm.openHtmlModal('shifts-builder-addResource', {
            onshow(modalElement) {
                // Populate shift details
                const shiftTypeElement = modalElement.querySelector('#builderAddResource--shiftType');
                const shiftNumberElement = modalElement.querySelector('#builderAddResource--shiftNumber');
                const shiftTimeElement = modalElement.querySelector('#builderAddResource--shiftTime');
                const supervisorElement = modalElement.querySelector('#builderAddResource--supervisor');
                shiftTypeElement.textContent = shift.shiftTypeDataListItem ?? 'Shift';
                shiftNumberElement.textContent = `#${shift.shiftId}`;
                shiftTimeElement.textContent = shift.shiftTimeDataListItem ?? '';
                supervisorElement.textContent =
                    shift.supervisorLastName !== null
                        ? `${shift.supervisorLastName}, ${shift.supervisorFirstName}`
                        : 'None';
                // Setup tabs based on view mode
                const tabsElement = modalElement.querySelector('#builderAddResource--tabs');
                tabsElement.innerHTML = '';
                if (viewMode === 'employees') {
                    // Create tabs for Employees, Equipment, and Crews
                    const employeesTab = document.createElement('li');
                    employeesTab.className = 'is-active';
                    const employeesLink = document.createElement('a');
                    employeesLink.href = '#';
                    employeesLink.textContent = 'Employees';
                    employeesLink.dataset.tab = 'employees';
                    employeesTab.append(employeesLink);
                    const equipmentTab = document.createElement('li');
                    const equipmentLink = document.createElement('a');
                    equipmentLink.href = '#';
                    equipmentLink.textContent = 'Equipment';
                    equipmentLink.dataset.tab = 'equipment';
                    equipmentTab.append(equipmentLink);
                    const crewsTab = document.createElement('li');
                    const crewsLink = document.createElement('a');
                    crewsLink.href = '#';
                    crewsLink.textContent = 'Crews';
                    crewsLink.dataset.tab = 'crews';
                    crewsTab.append(crewsLink);
                    tabsElement.append(employeesTab, equipmentTab, crewsTab);
                    // Show employees tab by default
                    const employeesContent = modalElement.querySelector('#builderAddResource--tabContent-employees');
                    employeesContent.classList.remove('is-hidden');
                    // Load available employees
                    loadAvailableEmployeesForModal(modalElement, shift);
                }
                else {
                    // Create tab for Work Orders
                    const workOrdersTab = document.createElement('li');
                    workOrdersTab.className = 'is-active';
                    const workOrdersLink = document.createElement('a');
                    workOrdersLink.href = '#';
                    workOrdersLink.textContent = 'Work Orders';
                    workOrdersLink.dataset.tab = 'workOrders';
                    workOrdersTab.append(workOrdersLink);
                    tabsElement.append(workOrdersTab);
                    // Show work orders tab
                    const workOrdersContent = modalElement.querySelector('#builderAddResource--tabContent-workOrders');
                    workOrdersContent.classList.remove('is-hidden');
                }
                // Tab switching
                tabsElement.addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.tagName === 'A' && target.dataset.tab !== undefined) {
                        event.preventDefault();
                        // Update active tab
                        const allTabs = tabsElement.querySelectorAll('li');
                        for (const tab of allTabs) {
                            tab.classList.remove('is-active');
                        }
                        target.parentElement?.classList.add('is-active');
                        // Hide all tab content
                        const allContent = modalElement.querySelectorAll('[id^="builderAddResource--tabContent-"]');
                        for (const content of allContent) {
                            content.classList.add('is-hidden');
                        }
                        // Show selected tab content
                        const selectedContent = modalElement.querySelector(`#builderAddResource--tabContent-${target.dataset.tab}`);
                        selectedContent.classList.remove('is-hidden');
                        // Load data for the selected tab
                        switch (target.dataset.tab) {
                            case 'crews': {
                                loadAvailableCrewsForModal(modalElement, shift);
                                break;
                            }
                            case 'employees': {
                                loadAvailableEmployeesForModal(modalElement, shift);
                                break;
                            }
                            case 'equipment': {
                                loadAvailableEquipmentForModal(modalElement, shift);
                                break;
                            }
                            case 'workOrders': {
                                // Work orders are search-based, don't auto-load
                                break;
                            }
                        }
                    }
                });
                // Filter functionality
                setupFilterListeners(modalElement);
                // Work order search
                const searchButton = modalElement.querySelector('#builderAddResource--searchWorkOrders');
                const workOrderFilter = modalElement.querySelector('#builderAddResource--workOrderFilter');
                searchButton.addEventListener('click', () => {
                    searchWorkOrders(modalElement, workOrderFilter.value);
                });
                // Allow Enter key to trigger search
                workOrderFilter.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        searchWorkOrders(modalElement, workOrderFilter.value);
                    }
                });
                // Add button handler
                const addButton = modalElement.querySelector('#builderAddResource--addButton');
                addButton.addEventListener('click', () => {
                    addSelectedResources(modalElement, shift.shiftId);
                });
                // Success message close button
                const successMessage = modalElement.querySelector('#builderAddResource--successMessage');
                const deleteButton = successMessage.querySelector('.delete');
                deleteButton?.addEventListener('click', () => {
                    successMessage.classList.add('is-hidden');
                });
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function loadAvailableEmployeesForModal(modalElement, shift) {
        const shiftDateString = shiftDateElement.value;
        cityssm.postJSON(`${shiftUrlPrefix}/doGetAvailableResources`, { shiftDateString }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                // Filter out employees already on the shift
                const shiftEmployeeNumbers = new Set(shift.employees.map((employee) => employee.employeeNumber));
                const availableEmployees = responseJSON.employees.filter((employee) => !shiftEmployeeNumbers.has(employee.employeeNumber));
                const employeeList = modalElement.querySelector('#builderAddResource--employeeList');
                employeeList.innerHTML = '';
                if (availableEmployees.length === 0) {
                    employeeList.innerHTML =
                        '<p class="has-text-grey-light">No available employees</p>';
                }
                else {
                    for (const employee of availableEmployees) {
                        const label = document.createElement('label');
                        label.className = 'checkbox is-block mb-2';
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = employee.employeeNumber;
                        checkbox.dataset.resourceType = 'employee';
                        label.append(checkbox, ` ${employee.lastName}, ${employee.firstName} (#${employee.employeeNumber})`);
                        employeeList.append(label);
                    }
                }
            }
        });
    }
    function loadAvailableEquipmentForModal(modalElement, shift) {
        const shiftDateString = shiftDateElement.value;
        cityssm.postJSON(`${shiftUrlPrefix}/doGetAvailableResources`, { shiftDateString }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                // Filter out equipment already on the shift
                const shiftEquipmentNumbers = new Set(shift.equipment.map((e) => e.equipmentNumber));
                const availableEquipment = responseJSON.equipment.filter((e) => !shiftEquipmentNumbers.has(e.equipmentNumber));
                const equipmentList = modalElement.querySelector('#builderAddResource--equipmentList');
                equipmentList.innerHTML = '';
                if (availableEquipment.length === 0) {
                    equipmentList.innerHTML =
                        '<p class="has-text-grey-light">No available equipment</p>';
                }
                else {
                    for (const equipment of availableEquipment) {
                        const label = document.createElement('label');
                        label.className = 'checkbox is-block mb-2';
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = equipment.equipmentNumber;
                        checkbox.dataset.resourceType = 'equipment';
                        label.append(checkbox, ` ${equipment.equipmentName} (#${equipment.equipmentNumber})`);
                        equipmentList.append(label);
                    }
                }
            }
        });
    }
    function loadAvailableCrewsForModal(modalElement, shift) {
        const shiftDateString = shiftDateElement.value;
        cityssm.postJSON(`${shiftUrlPrefix}/doGetAvailableResources`, { shiftDateString }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                // Filter out crews already on the shift
                const shiftCrewIds = new Set(shift.crews.map((c) => c.crewId));
                const availableCrews = responseJSON.crews.filter((c) => !shiftCrewIds.has(c.crewId));
                const crewList = modalElement.querySelector('#builderAddResource--crewList');
                crewList.innerHTML = '';
                if (availableCrews.length === 0) {
                    crewList.innerHTML =
                        '<p class="has-text-grey-light">No available crews</p>';
                }
                else {
                    for (const crew of availableCrews) {
                        const label = document.createElement('label');
                        label.className = 'checkbox is-block mb-2';
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = crew.crewId.toString();
                        checkbox.dataset.resourceType = 'crew';
                        label.append(checkbox, ` ${crew.crewName}`);
                        crewList.append(label);
                    }
                }
            }
        });
    }
    function searchWorkOrders(modalElement, searchString) {
        if (searchString.trim() === '') {
            bulmaJS.alert({
                contextualColorName: 'warning',
                message: 'Please enter search terms.'
            });
            return;
        }
        cityssm.postJSON(`${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doSearchWorkOrders`, { searchString, orderBy: 'workOrderNumber desc', limit: 20, offset: 0 }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                const workOrderList = modalElement.querySelector('#builderAddResource--workOrderList');
                workOrderList.innerHTML = '';
                if (responseJSON.count === 0) {
                    workOrderList.innerHTML =
                        '<p class="has-text-grey-light">No work orders found</p>';
                }
                else {
                    for (const workOrder of responseJSON.workOrders) {
                        const label = document.createElement('label');
                        label.className = 'checkbox is-block mb-2';
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = workOrder.workOrderId.toString();
                        checkbox.dataset.resourceType = 'workOrder';
                        const details = workOrder.workOrderDetails === ''
                            ? ''
                            : ` - ${workOrder.workOrderDetails}`;
                        label.append(checkbox, ` ${workOrder.workOrderNumber}${details}`);
                        workOrderList.append(label);
                    }
                }
            }
        });
    }
    function setupFilterListeners(modalElement) {
        // Employee filter
        const employeeFilter = modalElement.querySelector('#builderAddResource--employeeFilter');
        employeeFilter?.addEventListener('input', () => {
            filterCheckboxes('#builderAddResource--employeeList', employeeFilter.value);
        });
        // Equipment filter
        const equipmentFilter = modalElement.querySelector('#builderAddResource--equipmentFilter');
        equipmentFilter?.addEventListener('input', () => {
            filterCheckboxes('#builderAddResource--equipmentList', equipmentFilter.value);
        });
        // Crew filter
        const crewFilter = modalElement.querySelector('#builderAddResource--crewFilter');
        crewFilter?.addEventListener('input', () => {
            filterCheckboxes('#builderAddResource--crewList', crewFilter.value);
        });
    }
    function filterCheckboxes(containerSelector, filterText) {
        const container = document.querySelector(containerSelector);
        if (container === null)
            return;
        const labels = container.querySelectorAll('label.checkbox');
        const lowerFilter = filterText.toLowerCase();
        for (const label of labels) {
            const text = label.textContent.toLowerCase();
            if (text.includes(lowerFilter)) {
                ;
                label.style.display = 'block';
            }
            else {
                ;
                label.style.display = 'none';
            }
        }
    }
    function addSelectedResources(modalElement, shiftId) {
        const checkedBoxes = modalElement.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) {
            bulmaJS.alert({
                contextualColorName: 'warning',
                message: 'Please select at least one resource to add.'
            });
            return;
        }
        const successText = modalElement.querySelector('#builderAddResource--successText');
        const successMessage = modalElement.querySelector('#builderAddResource--successMessage');
        let addedCount = 0;
        const totalToAdd = checkedBoxes.length;
        for (const checkbox of checkedBoxes) {
            const resourceType = checkbox.dataset.resourceType;
            const resourceId = checkbox.value;
            switch (resourceType) {
                case 'crew': {
                    cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftCrew`, {
                        crewId: resourceId,
                        shiftCrewNote: '',
                        shiftId
                    }, (response) => {
                        addedCount += 1;
                        checkbox.checked = false;
                        if (addedCount === totalToAdd) {
                            successText.textContent = `Successfully added ${totalToAdd} resource(s) to the shift.`;
                            successMessage.classList.remove('is-hidden');
                            loadShifts();
                            loadAvailableResources();
                        }
                    });
                    break;
                }
                case 'employee': {
                    cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
                        employeeNumber: resourceId,
                        shiftEmployeeNote: '',
                        shiftId
                    }, (response) => {
                        addedCount += 1;
                        checkbox.checked = false;
                        if (addedCount === totalToAdd) {
                            successText.textContent = `Successfully added ${totalToAdd} resource(s) to the shift.`;
                            successMessage.classList.remove('is-hidden');
                            loadShifts();
                            loadAvailableResources();
                        }
                    });
                    break;
                }
                case 'equipment': {
                    cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                        equipmentNumber: resourceId,
                        shiftEquipmentNote: '',
                        shiftId
                    }, (response) => {
                        addedCount += 1;
                        checkbox.checked = false;
                        if (addedCount === totalToAdd) {
                            successText.textContent = `Successfully added ${totalToAdd} resource(s) to the shift.`;
                            successMessage.classList.remove('is-hidden');
                            loadShifts();
                            loadAvailableResources();
                        }
                    });
                    break;
                }
                case 'workOrder': {
                    cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftWorkOrder`, {
                        shiftId,
                        shiftWorkOrderNote: '',
                        workOrderId: resourceId
                    }, (response) => {
                        addedCount++;
                        checkbox.checked = false;
                        if (addedCount === totalToAdd) {
                            successText.textContent = `Successfully added ${totalToAdd} resource(s) to the shift.`;
                            successMessage.classList.remove('is-hidden');
                            loadShifts();
                            loadAvailableResources();
                        }
                    });
                    break;
                }
            }
        }
    }
    // Setup collapsible resource sections
    function setupResourceCollapsibles() {
        const headers = document.querySelectorAll('.resource-section-header');
        for (const header of headers) {
            header.addEventListener('click', () => {
                const section = header.dataset.section;
                if (section === undefined)
                    return;
                const content = document.querySelector(`#available--${section} .resource-section-content`);
                if (content !== null) {
                    header.classList.toggle('is-collapsed');
                    content.classList.toggle('is-hidden');
                }
            });
        }
    }
    // Helper function to get resource counts
    function getResourceCounts() {
        return {
            employees: document.querySelectorAll('#available--employees .available-items > div[data-employee-number]').length,
            equipment: document.querySelectorAll('#available--equipment .available-items > div[data-equipment-number]').length,
            crews: document.querySelectorAll('#available--crews .available-items > div[data-crew-id]').length
        };
    }
    // Setup search filter for available resources
    function setupResourceFilter() {
        const filterInput = document.querySelector('#availableResources--filter');
        if (filterInput === null)
            return;
        filterInput.addEventListener('input', () => {
            const filterText = filterInput.value.toLowerCase();
            // Filter all resource items
            const allResourceItems = document.querySelectorAll('#container--availableResources .available-items > div');
            let employeesVisible = 0;
            let equipmentVisible = 0;
            let crewsVisible = 0;
            for (const item of allResourceItems) {
                const text = item.textContent?.toLowerCase() ?? '';
                const isVisible = text.includes(filterText);
                if (isVisible) {
                    item.style.display = '';
                    // Count visible items by type
                    if (item.dataset.employeeNumber !== undefined) {
                        employeesVisible += 1;
                    }
                    else if (item.dataset.equipmentNumber !== undefined) {
                        equipmentVisible += 1;
                    }
                    else if (item.dataset.crewId !== undefined) {
                        crewsVisible += 1;
                    }
                }
                else {
                    item.style.display = 'none';
                }
            }
            // Update count tags
            const employeesCountTag = document.querySelector('#employees-count');
            const equipmentCountTag = document.querySelector('#equipment-count');
            const crewsCountTag = document.querySelector('#crews-count');
            const totals = getResourceCounts();
            if (filterText === '') {
                // Reset to show total counts
                if (employeesCountTag !== null) {
                    employeesCountTag.textContent = totals.employees.toString();
                }
                if (equipmentCountTag !== null) {
                    equipmentCountTag.textContent = totals.equipment.toString();
                }
                if (crewsCountTag !== null) {
                    crewsCountTag.textContent = totals.crews.toString();
                }
            }
            else {
                // Show filtered counts
                if (employeesCountTag !== null) {
                    employeesCountTag.textContent = `${employeesVisible}/${totals.employees}`;
                }
                if (equipmentCountTag !== null) {
                    equipmentCountTag.textContent = `${equipmentVisible}/${totals.equipment}`;
                }
                if (crewsCountTag !== null) {
                    crewsCountTag.textContent = `${crewsVisible}/${totals.crews}`;
                }
            }
        });
    }
    // Initialize resource section features
    setupResourceCollapsibles();
    setupResourceFilter();
    // Load shifts for today on page load
    loadShifts();
})();
