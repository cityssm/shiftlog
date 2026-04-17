(() => {
    const shiftLog = exports.shiftLog;
    const shiftUrlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`;
    const shiftDateElement = document.querySelector('#builder--shiftDate');
    const viewModeElement = document.querySelector('#builder--viewMode');
    const resultsContainerElement = document.querySelector('#container--shiftBuilderResults');
    let currentShifts = [];
    const lockedShifts = new Set();
    function getItemKey(type, id) {
        return `${type}:${id}`;
    }
    function findDuplicates(shifts) {
        const tracker = {};
        for (const shift of shifts) {
            for (const employee of shift.employees) {
                const key = getItemKey('employee', employee.employeeNumber);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
            for (const equipment of shift.equipment) {
                const key = getItemKey('equipment', equipment.equipmentNumber);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
            for (const crew of shift.crews) {
                const key = getItemKey('crew', crew.crewId);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
            for (const workOrder of shift.workOrders) {
                const key = getItemKey('workOrder', workOrder.workOrderId);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
            for (const adhocTask of shift.adhocTasks) {
                const key = getItemKey('adhocTask', adhocTask.adhocTaskId);
                tracker[key] ??= [];
                tracker[key].push(shift.shiftId);
            }
        }
        for (const key in tracker) {
            if (tracker[key].length <= 1) {
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
        if (shift.crews.length > 0) {
            const crewsSection = document.createElement('div');
            crewsSection.className = 'mb-3';
            const crewsLabel = document.createElement('strong');
            crewsLabel.textContent = 'Crews:';
            crewsSection.append(crewsLabel);
            const crewsList = document.createElement('ul');
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
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-users"></i>';
                crewItem.append(icon, ' ');
                const nameSpan = document.createElement('span');
                nameSpan.textContent = crew.crewName;
                crewItem.append(nameSpan);
                if (crew.shiftCrewNote !== '') {
                    const noteIcon = document.createElement('span');
                    noteIcon.className = 'icon is-small has-text-grey-light ml-1';
                    noteIcon.innerHTML = '<i class="fa-solid fa-note-sticky"></i>';
                    noteIcon.title = crew.shiftCrewNote;
                    crewItem.append(' ', noteIcon);
                }
                if (isEditable) {
                    crewItem.addEventListener('dblclick', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openEditCrewNoteModal(shift.shiftId, crew);
                    });
                    crewItem.style.cursor = 'pointer';
                }
                crewsList.append(crewItem);
            }
            crewsSection.append(crewsList);
            containerElement.append(crewsSection);
        }
        if (shift.employees.length > 0) {
            const employeesSection = document.createElement('div');
            employeesSection.className = 'mb-3';
            const employeesLabel = document.createElement('strong');
            employeesLabel.textContent = 'Employees:';
            employeesSection.append(employeesLabel);
            const employeesList = document.createElement('ul');
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
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-user"></i>';
                employeeItem.append(icon, ' ');
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
                    const noteIcon = document.createElement('span');
                    noteIcon.className = 'icon is-small has-text-grey-light ml-1';
                    noteIcon.innerHTML = '<i class="fa-solid fa-note-sticky"></i>';
                    noteIcon.title = employee.shiftEmployeeNote;
                    employeeItem.append(' ', noteIcon);
                }
                if (isEditable) {
                    employeeItem.addEventListener('dblclick', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openEditEmployeeCrewNoteModal(shift.shiftId, employee, shift.crews);
                    });
                    employeeItem.style.cursor = 'pointer';
                }
                employeesList.append(employeeItem);
            }
            employeesSection.append(employeesList);
            containerElement.append(employeesSection);
        }
        if (shift.equipment.length > 0) {
            const equipmentSection = document.createElement('div');
            equipmentSection.className = 'mb-3';
            const equipmentLabel = document.createElement('strong');
            equipmentLabel.textContent = 'Equipment:';
            equipmentSection.append(equipmentLabel);
            const equipmentList = document.createElement('ul');
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
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-truck"></i>';
                equipmentItem.append(icon, ' ');
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
                    const noteIcon = document.createElement('span');
                    noteIcon.className = 'icon is-small has-text-grey-light ml-1';
                    noteIcon.innerHTML = '<i class="fa-solid fa-note-sticky"></i>';
                    noteIcon.title = equipment.shiftEquipmentNote;
                    equipmentItem.append(' ', noteIcon);
                }
                if (isEditable) {
                    equipmentItem.addEventListener('dblclick', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openEditEquipmentEmployeeNoteModal(shift.shiftId, equipment, shift.employees);
                    });
                    equipmentItem.style.cursor = 'pointer';
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
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-clipboard-list"></i>';
                workOrderItem.append(icon, ' ');
                const workOrderLink = document.createElement('a');
                workOrderLink.href = shiftLog.buildWorkOrderURL(workOrder.workOrderId);
                workOrderLink.target = '_blank';
                workOrderLink.textContent = workOrder.workOrderNumber;
                workOrderItem.append(workOrderLink);
                if (workOrder.workOrderDetails !== '') {
                    workOrderItem.append(` - ${workOrder.workOrderDetails}`);
                }
                if (workOrder.shiftWorkOrderNote !== '') {
                    const noteIcon = document.createElement('span');
                    noteIcon.className = 'icon is-small has-text-grey-light ml-1';
                    noteIcon.innerHTML = '<i class="fa-solid fa-note-sticky"></i>';
                    noteIcon.title = workOrder.shiftWorkOrderNote;
                    workOrderItem.append(' ', noteIcon);
                }
                if (isEditable) {
                    workOrderItem.addEventListener('dblclick', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openEditWorkOrderNoteModal(shift.shiftId, workOrder);
                    });
                    workOrderItem.style.cursor = 'pointer';
                }
                workOrdersList.append(workOrderItem);
            }
            workOrdersSection.append(workOrdersList);
            containerElement.append(workOrdersSection);
        }
        if (shift.adhocTasks.length > 0) {
            const adhocTasksSection = document.createElement('div');
            adhocTasksSection.className = 'mb-3';
            const adhocTasksLabel = document.createElement('strong');
            adhocTasksLabel.textContent = 'Ad Hoc Tasks:';
            adhocTasksSection.append(adhocTasksLabel);
            const adhocTasksList = document.createElement('ul');
            for (const adhocTask of shift.adhocTasks) {
                const isDup = isDuplicate(duplicates, 'adhocTask', adhocTask.adhocTaskId);
                const adhocTaskItem = document.createElement('li');
                if (isDup) {
                    adhocTaskItem.classList.add('has-background-warning-light');
                }
                if (isEditable) {
                    adhocTaskItem.classList.add('drop-target-adhocTask');
                }
                if (isDraggable) {
                    adhocTaskItem.draggable = true;
                }
                adhocTaskItem.dataset.adhocTaskId = adhocTask.adhocTaskId.toString();
                const icon = document.createElement('span');
                icon.className = 'icon is-small';
                icon.innerHTML = '<i class="fa-solid fa-tasks"></i>';
                adhocTaskItem.append(icon, ' ');
                if (adhocTask.adhocTaskTypeDataListItem) {
                    const taskTypeBadge = document.createElement('span');
                    taskTypeBadge.className = 'tag is-small is-info mr-1';
                    taskTypeBadge.textContent = adhocTask.adhocTaskTypeDataListItem;
                    adhocTaskItem.append(taskTypeBadge);
                }
                const descriptionSpan = document.createElement('span');
                descriptionSpan.textContent = adhocTask.taskDescription;
                adhocTaskItem.append(descriptionSpan);
                if (adhocTask.locationAddress1) {
                    const locationSpan = document.createElement('span');
                    locationSpan.className = 'has-text-grey-light is-size-7';
                    locationSpan.textContent = ` (${adhocTask.locationAddress1}${adhocTask.locationCityProvince
                        ? `, ${adhocTask.locationCityProvince}`
                        : ''})`;
                    adhocTaskItem.append(locationSpan);
                }
                if (adhocTask.shiftAdhocTaskNote !== '') {
                    const noteSpan = document.createElement('span');
                    noteSpan.className = 'has-text-grey-light';
                    noteSpan.textContent = ` - ${adhocTask.shiftAdhocTaskNote}`;
                    adhocTaskItem.append(noteSpan);
                }
                adhocTasksList.append(adhocTaskItem);
            }
            adhocTasksSection.append(adhocTasksList);
            containerElement.append(adhocTasksSection);
        }
        if (shift.workOrders.length === 0 && shift.adhocTasks.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'has-text-grey-light';
            emptyMessage.textContent = 'No tasks assigned';
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
        const headerLevel = document.createElement('div');
        headerLevel.className = 'level is-mobile mb-3';
        const levelLeft = document.createElement('div');
        levelLeft.className = 'level-left';
        if (isEditable) {
            const lockItem = document.createElement('div');
            lockItem.className = 'level-item';
            const lockButton = document.createElement('button');
            lockButton.className = 'button is-small is-ghost';
            lockButton.type = 'button';
            lockButton.title = `Lock/Unlock ${shiftLog.shiftsSectionNameSingular} Drag and Drop`;
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
        const contentElement = document.createElement('div');
        contentElement.className = 'content is-small';
        const timeParagraph = document.createElement('p');
        timeParagraph.className = 'mb-2';
        const timeLabel = document.createElement('strong');
        timeLabel.textContent = 'Time:';
        timeParagraph.append(timeLabel, ` ${shift.shiftTimeDataListItem ?? ''}`);
        contentElement.append(timeParagraph);
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
        const viewContent = viewMode === 'employees'
            ? renderEmployeesView(shift, duplicates)
            : renderTasksView(shift, duplicates);
        boxElement.append(viewContent);
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
            resultsContainerElement.innerHTML = `
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
            currentShifts = responseJSON.shifts;
            renderShifts();
            loadAvailableResources();
        });
    }
    function loadAvailableResources() {
        const availableResourcesContainer = document.querySelector('#container--availableResources');
        if (availableResourcesContainer === null) {
            return;
        }
        const shiftDateString = shiftDateElement.value;
        if (shiftDateString === '') {
            return;
        }
        const viewMode = viewModeElement.value;
        if (viewMode === 'tasks') {
            cityssm.postJSON(`${shiftUrlPrefix}/doGetAvailableAdhocTasks`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                renderAvailableAdhocTasks(responseJSON.adhocTasks);
            });
        }
        else {
            cityssm.postJSON(`${shiftUrlPrefix}/doGetAvailableResources`, {
                shiftDateString
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                renderAvailableResources(responseJSON);
            });
        }
    }
    function renderAvailableResources(resources) {
        const employeesSection = document.querySelector('#available--employees');
        const equipmentSection = document.querySelector('#available--equipment');
        const crewsSection = document.querySelector('#available--crews');
        if (employeesSection !== null)
            employeesSection.style.display = 'block';
        if (equipmentSection !== null)
            equipmentSection.style.display = 'block';
        if (crewsSection !== null)
            crewsSection.style.display = 'block';
        const adhocTasksSection = document.querySelector('#available--adhocTasks');
        if (adhocTasksSection)
            adhocTasksSection.style.display = 'none';
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
                    const icon = document.createElement('span');
                    icon.className = 'icon';
                    icon.innerHTML = '<i class="fa-solid fa-user"></i>';
                    itemBox.append(icon, ' ');
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
        const employeesCountTag = document.querySelector('#employees-count');
        if (employeesCountTag !== null) {
            employeesCountTag.textContent = resources.employees.length.toString();
        }
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
                    const icon = document.createElement('span');
                    icon.className = 'icon';
                    icon.innerHTML = '<i class="fa-solid fa-truck"></i>';
                    itemBox.append(icon, ' ');
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
        const equipmentCountTag = document.querySelector('#equipment-count');
        if (equipmentCountTag !== null) {
            equipmentCountTag.textContent = resources.equipment.length.toString();
        }
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
                    const icon = document.createElement('span');
                    icon.className = 'icon';
                    icon.innerHTML = '<i class="fa-solid fa-users"></i>';
                    itemBox.append(icon, ' ');
                    const itemText = document.createElement('span');
                    itemText.className = 'is-size-7';
                    itemText.textContent = crew.crewName;
                    itemBox.append(itemText);
                    itemsContainer.append(itemBox);
                }
                crewsList.append(itemsContainer);
            }
        }
        const crewsCountTag = document.querySelector('#crews-count');
        if (crewsCountTag !== null) {
            crewsCountTag.textContent = resources.crews.length.toString();
        }
    }
    function renderAvailableAdhocTasks(adhocTasks) {
        const employeesSection = document.querySelector('#available--employees');
        const equipmentSection = document.querySelector('#available--equipment');
        const crewsSection = document.querySelector('#available--crews');
        if (employeesSection !== null)
            employeesSection.style.display = 'none';
        if (equipmentSection !== null)
            equipmentSection.style.display = 'none';
        if (crewsSection !== null)
            crewsSection.style.display = 'none';
        let adhocTasksSection = document.querySelector('#available--adhocTasks');
        if (!adhocTasksSection) {
            adhocTasksSection = document.createElement('div');
            adhocTasksSection.id = 'available--adhocTasks';
            adhocTasksSection.className = 'mb-4';
            adhocTasksSection.innerHTML = `
        <h4 class="subtitle is-6 is-clickable resource-section-header" data-section="adhocTasks">
          <span class="icon is-small">
            <i class="fa-solid fa-chevron-down"></i>
          </span>
          <span>Ad Hoc Tasks</span>
          <span class="tag is-info is-light ml-2" id="adhocTasks-count">0</span>
        </h4>
        <div class="available-resources-list resource-section-content" data-resource-type="adhocTask">
          <p class="has-text-grey-light is-size-7">No available tasks</p>
        </div>
        <button class="button is-small is-success is-fullwidth mt-3" id="button--createStandaloneAdhocTask" type="button">
          <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
          <span>Create Ad Hoc Task</span>
        </button>
      `;
            const container = document.querySelector('#container--availableResources .box');
            const filterField = container.querySelector('.field');
            container.insertBefore(adhocTasksSection, filterField.nextSibling);
            const header = adhocTasksSection.querySelector('.resource-section-header');
            if (header !== null) {
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
        adhocTasksSection.style.display = 'block';
        const adhocTasksList = adhocTasksSection.querySelector('.available-resources-list');
        adhocTasksList.textContent = '';
        if (adhocTasks.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'has-text-grey-light is-size-7';
            emptyMessage.textContent = 'No available tasks';
            adhocTasksList.append(emptyMessage);
        }
        else {
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'available-items';
            for (const adhocTask of adhocTasks) {
                const itemBox = document.createElement('div');
                itemBox.className = 'box p-2 mb-2';
                itemBox.draggable = true;
                itemBox.dataset.adhocTaskId = adhocTask.adhocTaskId.toString();
                itemBox.dataset.fromAvailable = 'true';
                const icon = document.createElement('span');
                icon.className = 'icon';
                icon.innerHTML = '<i class="fa-solid fa-tasks"></i>';
                itemBox.append(icon, ' ');
                if (adhocTask.adhocTaskTypeDataListItem) {
                    const taskTypeBadge = document.createElement('span');
                    taskTypeBadge.className = 'tag is-small is-info mr-1';
                    taskTypeBadge.textContent = adhocTask.adhocTaskTypeDataListItem;
                    itemBox.append(taskTypeBadge);
                }
                const itemText = document.createElement('div');
                itemText.className = 'is-size-7';
                itemText.textContent = adhocTask.taskDescription;
                itemBox.append(itemText);
                if (adhocTask.locationAddress1) {
                    const locationSpan = document.createElement('div');
                    locationSpan.className = 'has-text-grey is-size-7';
                    locationSpan.textContent = `${adhocTask.locationAddress1}${adhocTask.locationCityProvince
                        ? `, ${adhocTask.locationCityProvince}`
                        : ''}`;
                    itemBox.append(locationSpan);
                }
                itemsContainer.append(itemBox);
            }
            adhocTasksList.append(itemsContainer);
        }
        const adhocTasksCountTag = document.querySelector('#adhocTasks-count');
        if (adhocTasksCountTag !== null) {
            adhocTasksCountTag.textContent = adhocTasks.length.toString();
        }
        const createButton = document.querySelector('#button--createStandaloneAdhocTask');
        if (createButton && !createButton.dataset.hasListener) {
            createButton.dataset.hasListener = 'true';
            createButton.addEventListener('click', openCreateStandaloneAdhocTaskModal);
        }
    }
    function toggleShiftLock(shiftId) {
        if (lockedShifts.has(shiftId)) {
            lockedShifts.delete(shiftId);
        }
        else {
            lockedShifts.add(shiftId);
        }
        renderShifts();
    }
    let draggedElement = null;
    let draggedData = null;
    function handleDragStart(event) {
        const target = event.target.closest('[draggable="true"]');
        if (target === null) {
            return;
        }
        const employeeNumber = target.dataset.employeeNumber;
        const equipmentNumber = target.dataset.equipmentNumber;
        const crewId = target.dataset.crewId;
        const workOrderId = target.dataset.workOrderId;
        const adhocTaskId = target.dataset.adhocTaskId;
        const fromAvailable = target.dataset.fromAvailable === 'true';
        const shiftCard = target.closest('[data-shift-id]');
        const fromShiftId = fromAvailable
            ? 0
            : Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
        if (fromShiftId !== 0 && lockedShifts.has(fromShiftId)) {
            event.preventDefault();
            return;
        }
        draggedElement = target;
        target.classList.add('is-dragging');
        if (employeeNumber !== undefined) {
            let isSupervisor = false;
            if (fromAvailable && target.dataset.isSupervisor !== undefined) {
                isSupervisor = target.dataset.isSupervisor === 'true';
            }
            else if (!fromAvailable) {
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
        else if (adhocTaskId !== undefined) {
            draggedData = {
                fromShiftId,
                id: Number.parseInt(adhocTaskId, 10),
                type: 'adhocTask'
            };
        }
        if (event.dataTransfer !== null) {
            event.dataTransfer.effectAllowed = 'move';
        }
    }
    function handleDragEnd(event) {
        const target = event.target.closest('[draggable="true"]');
        if (target !== null) {
            target.classList.remove('is-dragging');
        }
        if (draggedElement !== null) {
            draggedElement.classList.remove('is-dragging');
        }
        draggedElement = null;
        draggedData = null;
        for (const element of document.querySelectorAll('.is-drop-target')) {
            element.classList.remove('is-drop-target');
        }
    }
    function handleDragOver(event) {
        event.preventDefault();
        const target = event.target;
        for (const element of document.querySelectorAll('.is-drop-target')) {
            element.classList.remove('is-drop-target');
        }
        const availableResourcesSidebar = target.closest('#container--availableResources');
        if (availableResourcesSidebar !== null &&
            draggedData !== null &&
            draggedData.fromShiftId > 0) {
            const sidebarBox = availableResourcesSidebar.querySelector('.box');
            if (sidebarBox !== null) {
                sidebarBox.classList.add('is-drop-target');
            }
            if (event.dataTransfer !== null) {
                event.dataTransfer.dropEffect = 'move';
            }
            return;
        }
        const supervisorTarget = target.closest('.drop-target-supervisor');
        const crewTarget = target.closest('.drop-target-crew');
        const employeeTarget = target.closest('.drop-target-employee');
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
        const availableResourcesSidebar = target.closest('#container--availableResources');
        if (availableResourcesSidebar !== null && draggedData.fromShiftId > 0) {
            removeFromShift(draggedData);
            return;
        }
        const supervisorTarget = target.closest('.drop-target-supervisor');
        const crewTarget = target.closest('.drop-target-crew');
        const employeeTarget = target.closest('.drop-target-employee');
        if (supervisorTarget !== null && draggedData.type === 'employee') {
            const shiftId = Number.parseInt(supervisorTarget.dataset.shiftId ?? '0', 10);
            const targetShift = currentShifts.find((s) => s.shiftId === shiftId);
            const employeeNumber = draggedData.id;
            const isSupervisor = draggedData.isSupervisor ?? false;
            if (shiftId > 0 &&
                !lockedShifts.has(shiftId) &&
                targetShift !== undefined &&
                isShiftEditable(targetShift)) {
                if (!isSupervisor) {
                    bulmaJS.alert({
                        contextualColorName: 'warning',
                        title: 'Invalid Assignment',
                        message: 'Only employees marked as supervisors can be assigned to the supervisor position.'
                    });
                    return;
                }
                makeEmployeeSupervisor(employeeNumber, shiftId);
                return;
            }
        }
        if (crewTarget !== null && draggedData.type === 'employee') {
            const shiftCard = crewTarget.closest('[data-shift-id]');
            const shiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
            const crewId = Number.parseInt(crewTarget.dataset.crewId ?? '0', 10);
            const targetShift = currentShifts.find((s) => s.shiftId === shiftId);
            if (shiftId > 0 &&
                crewId > 0 &&
                !lockedShifts.has(shiftId) &&
                targetShift !== undefined &&
                isShiftEditable(targetShift)) {
                assignEmployeeToCrew(draggedData.id, draggedData.fromShiftId, shiftId, crewId);
                return;
            }
        }
        if (employeeTarget !== null && draggedData.type === 'equipment') {
            const shiftCard = employeeTarget.closest('[data-shift-id]');
            const shiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
            const employeeNumber = employeeTarget.dataset.employeeNumber ?? '';
            const targetShift = currentShifts.find((s) => s.shiftId === shiftId);
            if (shiftId > 0 &&
                employeeNumber !== '' &&
                !lockedShifts.has(shiftId) &&
                targetShift !== undefined &&
                isShiftEditable(targetShift)) {
                assignEquipmentToEmployee(draggedData.id, draggedData.fromShiftId, shiftId, employeeNumber);
                return;
            }
        }
        const shiftCard = target.closest('[data-shift-id]');
        const toShiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10);
        if (toShiftId === 0 || toShiftId === draggedData.fromShiftId) {
            return;
        }
        if (lockedShifts.has(toShiftId)) {
            return;
        }
        const targetShift = currentShifts.find((s) => s.shiftId === toShiftId);
        if (targetShift !== undefined && !isShiftEditable(targetShift)) {
            return;
        }
        switch (draggedData.type) {
            case 'adhocTask': {
                moveAdhocTask(draggedData.id, draggedData.fromShiftId, toShiftId);
                break;
            }
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
            case 'adhocTask': {
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftAdhocTask`, {
                    shiftId: draggedData.fromShiftId,
                    adhocTaskId: draggedData.id
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Ad hoc task removed from shift.'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to remove ad hoc task from shift.',
                            title: 'Error'
                        });
                    }
                });
                break;
            }
            case 'crew': {
                const crewEmployees = getCrewEmployees(draggedData.fromShiftId, draggedData.id);
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
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftCrew`, {
                    crewId: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
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
                            for (const employee of crewEmployees) {
                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
                                    employeeNumber: employee.employeeNumber,
                                    shiftId: draggedData.fromShiftId
                                }, (rawEmpResponseJSON) => {
                                    const empResponse = rawEmpResponseJSON;
                                    if (empResponse.success) {
                                        employeesDeletedCount += 1;
                                    }
                                    else {
                                        employeesFailedCount += 1;
                                    }
                                    if (employeesDeletedCount + employeesFailedCount ===
                                        totalEmployees) {
                                        if (totalEquipment === 0) {
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
                                            for (const equipment of crewEquipment) {
                                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                                                    equipmentNumber: equipment.equipmentNumber,
                                                    shiftId: draggedData.fromShiftId
                                                }, (rawEquipResponseJSON) => {
                                                    const equipmentResponse = rawEquipResponseJSON;
                                                    if (equipmentResponse.success) {
                                                        equipmentDeletedCount += 1;
                                                    }
                                                    else {
                                                        equipmentFailedCount += 1;
                                                    }
                                                    if (equipmentDeletedCount +
                                                        equipmentFailedCount ===
                                                        totalEquipment) {
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
                const assignedEquipment = getEmployeeEquipment(draggedData.fromShiftId, draggedData.id);
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
                    employeeNumber: draggedData.id,
                    shiftId: draggedData.fromShiftId
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
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
                            for (const equipment of assignedEquipment) {
                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                                    equipmentNumber: equipment.equipmentNumber,
                                    shiftId: draggedData.fromShiftId
                                }, (rawEquipResponse) => {
                                    const equipResponse = rawEquipResponse;
                                    if (equipResponse.success) {
                                        equipmentDeletedCount += 1;
                                        if (equipmentDeletedCount === totalEquipment) {
                                            bulmaJS.alert({
                                                contextualColorName: 'success',
                                                message: `Employee and ${totalEquipment} assigned equipment removed from shift.`
                                            });
                                            loadShifts();
                                        }
                                    }
                                    else {
                                        bulmaJS.alert({
                                            contextualColorName: 'warning',
                                            message: `Employee removed, but failed to remove assigned equipment: ${equipment.equipmentName} (#${equipment.equipmentNumber}).`,
                                            title: 'Partial Success'
                                        });
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
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
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
            case 'workOrder': {
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftWorkOrder`, {
                    shiftId: draggedData.fromShiftId,
                    workOrderId: draggedData.id
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Work order removed from shift.'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to remove work order from shift.',
                            title: 'Error'
                        });
                    }
                });
                break;
            }
        }
    }
    function moveEmployee(employeeNumber, fromShiftId, toShiftId) {
        if (fromShiftId === 0) {
            cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
                employeeNumber,
                shiftEmployeeNote: '',
                shiftId: toShiftId
            }, (rawResponseJSON) => {
                const addResponse = rawResponseJSON;
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
        const assignedEquipment = getEmployeeEquipment(fromShiftId, employeeNumber);
        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
            employeeNumber,
            shiftId: fromShiftId
        }, (rawResponseJSON) => {
            const deleteResponse = rawResponseJSON;
            if (deleteResponse.success) {
                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
                    employeeNumber,
                    shiftEmployeeNote: '',
                    shiftId: toShiftId
                }, (rawAddResponseJSON) => {
                    const addResponse = rawAddResponseJSON;
                    if (addResponse.success) {
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
                            for (const equipment of assignedEquipment) {
                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                                    equipmentNumber: equipment.equipmentNumber,
                                    shiftId: fromShiftId
                                }, (rawDeleteEquipResponse) => {
                                    const deleteEquipResponse = rawDeleteEquipResponse;
                                    if (deleteEquipResponse.success) {
                                        cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                                            equipmentNumber: equipment.equipmentNumber,
                                            employeeNumber,
                                            shiftEquipmentNote: '',
                                            shiftId: toShiftId
                                        }, (rawAddEquipResponse) => {
                                            const addEquipResponse = rawAddEquipResponse;
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
        if (fromShiftId === 0) {
            cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                equipmentNumber,
                shiftEquipmentNote: '',
                shiftId: toShiftId
            }, (rawAddResponseJSON) => {
                const addResponseJSON = rawAddResponseJSON;
                if (addResponseJSON.success) {
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
                        message: addResponseJSON.message ?? 'Failed to add equipment to shift.',
                        title: 'Error'
                    });
                }
            });
            return;
        }
        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
            equipmentNumber,
            shiftId: fromShiftId
        }, (rawDeleteResponseJSON) => {
            const deleteResponse = rawDeleteResponseJSON;
            if (deleteResponse.success) {
                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                    equipmentNumber,
                    shiftEquipmentNote: '',
                    shiftId: toShiftId
                }, (rawAddResponseJSON) => {
                    const addResponse = rawAddResponseJSON;
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
        if (fromShiftId === 0) {
            cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftCrew`, {
                crewId,
                shiftCrewNote: '',
                shiftId: toShiftId
            }, (rawAddResponseJSON) => {
                const addResponse = rawAddResponseJSON;
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
        const crewEmployees = getCrewEmployees(fromShiftId, crewId);
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
        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftCrew`, {
            crewId,
            shiftId: fromShiftId
        }, (rawDeleteResponseJSON) => {
            const deleteResponse = rawDeleteResponseJSON;
            if (deleteResponse.success) {
                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftCrew`, {
                    crewId,
                    shiftCrewNote: '',
                    shiftId: toShiftId
                }, (rawAddResponseJSON) => {
                    const addResponse = rawAddResponseJSON;
                    if (addResponse.success) {
                        let employeesProcessed = 0;
                        const totalEmployees = crewEmployees.length;
                        if (totalEmployees === 0) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Crew Moved',
                                message: 'Crew has been moved to the new shift.'
                            });
                            loadShifts();
                        }
                        else {
                            for (const employee of crewEmployees) {
                                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEmployee`, {
                                    employeeNumber: employee.employeeNumber,
                                    shiftId: fromShiftId
                                }, (rawDeleteEmpResponseJSON) => {
                                    const deleteEmpResponse = rawDeleteEmpResponseJSON;
                                    if (deleteEmpResponse.success) {
                                        cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
                                            crewId,
                                            employeeNumber: employee.employeeNumber,
                                            shiftEmployeeNote: '',
                                            shiftId: toShiftId
                                        }, () => {
                                            employeesProcessed += 1;
                                            if (employeesProcessed === totalEmployees) {
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
                                                    for (const equipment of crewEquipment) {
                                                        cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftEquipment`, {
                                                            equipmentNumber: equipment.equipmentNumber,
                                                            shiftId: fromShiftId
                                                        }, (deleteEqResponse) => {
                                                            if (deleteEqResponse.success) {
                                                                cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                                                                    employeeNumber: equipment.employeeNumber,
                                                                    equipmentNumber: equipment.equipmentNumber,
                                                                    shiftEquipmentNote: '',
                                                                    shiftId: toShiftId
                                                                }, (_addEqResponse) => {
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
        if (fromShiftId === 0) {
            cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftWorkOrder`, {
                shiftId: toShiftId,
                shiftWorkOrderNote: '',
                workOrderId
            }, (rawAddResponseJSON) => {
                const addResponseJSON = rawAddResponseJSON;
                if (addResponseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Work order has been added to the shift.',
                        title: 'Work Order Added'
                    });
                    loadShifts();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: addResponseJSON.errorMessage ??
                            'Failed to add work order to shift.',
                        title: 'Error'
                    });
                }
            });
            return;
        }
        cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftWorkOrder`, {
            shiftId: toShiftId,
            shiftWorkOrderNote: '',
            workOrderId
        }, (rawAddResponse) => {
            const addResponse = rawAddResponse;
            if (addResponse.success) {
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftWorkOrder`, {
                    shiftId: fromShiftId,
                    workOrderId
                }, (rawDeleteResponse) => {
                    const deleteResponse = rawDeleteResponse;
                    if (deleteResponse.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Work order has been moved to the new shift.',
                            title: 'Work Order Moved'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'warning',
                            message: 'Work order was added to the new shift but could not be removed from the original shift.',
                            title: 'Partial Success'
                        });
                        loadShifts();
                    }
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: addResponse.errorMessage ??
                        'Failed to add work order to new shift.',
                    title: 'Error'
                });
                loadShifts();
            }
        });
    }
    function moveAdhocTask(adhocTaskId, fromShiftId, toShiftId) {
        if (fromShiftId === 0) {
            cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftAdhocTask`, {
                shiftId: toShiftId,
                shiftAdhocTaskNote: '',
                adhocTaskId
            }, (rawAddResponse) => {
                const addResponse = rawAddResponse;
                if (addResponse.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Ad hoc task has been added to the shift.',
                        title: 'Task Added'
                    });
                    loadShifts();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: addResponse.errorMessage ??
                            'Failed to add ad hoc task to shift.',
                        title: 'Error'
                    });
                }
            });
            return;
        }
        cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftAdhocTask`, {
            shiftId: toShiftId,
            shiftAdhocTaskNote: '',
            adhocTaskId
        }, (rawAddResponse) => {
            const addResponse = rawAddResponse;
            if (addResponse.success) {
                cityssm.postJSON(`${shiftUrlPrefix}/doDeleteShiftAdhocTask`, {
                    shiftId: fromShiftId,
                    adhocTaskId
                }, (rawDeleteResponse) => {
                    const deleteResponse = rawDeleteResponse;
                    if (deleteResponse.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Ad hoc task has been moved to the new shift.',
                            title: 'Task Moved'
                        });
                        loadShifts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'warning',
                            message: 'Ad hoc task was added to the new shift but could not be removed from the original shift.',
                            title: 'Partial Success'
                        });
                        loadShifts();
                    }
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: addResponse.errorMessage ??
                        'Failed to add ad hoc task to new shift.',
                    title: 'Error'
                });
                loadShifts();
            }
        });
    }
    function makeEmployeeSupervisor(employeeNumber, shiftId) {
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
        if (fromShiftId === toShiftId) {
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
            }, (rawDeleteResponse) => {
                const deleteResponse = rawDeleteResponse;
                if (deleteResponse.success) {
                    cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEmployee`, {
                        crewId,
                        employeeNumber,
                        shiftEmployeeNote: '',
                        shiftId: toShiftId
                    }, (rawAddResponse) => {
                        const addResponse = rawAddResponse;
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
        if (fromShiftId === toShiftId) {
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
            }, (rawDeleteResponse) => {
                const deleteResponse = rawDeleteResponse;
                if (deleteResponse.success) {
                    cityssm.postJSON(`${shiftUrlPrefix}/doAddShiftEquipment`, {
                        employeeNumber,
                        equipmentNumber,
                        shiftEquipmentNote: '',
                        shiftId: toShiftId
                    }, (rawAddResponse) => {
                        const addResponse = rawAddResponse;
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
    shiftDateElement.addEventListener('change', loadShifts);
    viewModeElement.addEventListener('change', () => {
        renderShifts();
        loadAvailableResources();
    });
    resultsContainerElement.addEventListener('dragstart', handleDragStart);
    resultsContainerElement.addEventListener('dragend', handleDragEnd);
    resultsContainerElement.addEventListener('dragover', handleDragOver);
    resultsContainerElement.addEventListener('dragleave', handleDragLeave);
    resultsContainerElement.addEventListener('drop', handleDrop);
    const availableResourcesContainer = document.querySelector('#container--availableResources');
    if (availableResourcesContainer !== null) {
        availableResourcesContainer.addEventListener('dragstart', handleDragStart);
        availableResourcesContainer.addEventListener('dragend', handleDragEnd);
        availableResourcesContainer.addEventListener('dragover', handleDragOver);
        availableResourcesContainer.addEventListener('dragleave', handleDragLeave);
        availableResourcesContainer.addEventListener('drop', handleDrop);
    }
    if (flatpickr !== undefined) {
        flatpickr(shiftDateElement, {
            allowInput: true,
            dateFormat: 'Y-m-d',
            nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
            prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
        });
    }
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
                const dateInput = formElement.querySelector('[name="shiftDateString"]');
                dateInput.value = selectedDate;
                const shiftTypeSelect = modalElement.querySelector('#createShift--shiftTypeDataListItemId');
                const shiftTimeSelect = modalElement.querySelector('#createShift--shiftTimeDataListItemId');
                const supervisorSelect = modalElement.querySelector('#createShift--supervisorEmployeeNumber');
                cityssm.postJSON(`${shiftUrlPrefix}/doGetShiftCreationData`, {}, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    for (const shiftType of responseJSON.shiftTypes) {
                        const optionElement = document.createElement('option');
                        optionElement.value = shiftType.dataListItemId.toString();
                        optionElement.textContent = shiftType.dataListItem;
                        shiftTypeSelect.append(optionElement);
                    }
                    for (const shiftTime of responseJSON.shiftTimes) {
                        const optionElement = document.createElement('option');
                        optionElement.value = shiftTime.dataListItemId.toString();
                        optionElement.textContent = shiftTime.dataListItem;
                        shiftTimeSelect.append(optionElement);
                    }
                    for (const supervisor of responseJSON.supervisors) {
                        const optionElement = document.createElement('option');
                        optionElement.value = supervisor.employeeNumber;
                        optionElement.textContent = `${supervisor.lastName}, ${supervisor.firstName}`;
                        supervisorSelect.append(optionElement);
                    }
                });
                formElement.addEventListener('submit', (submitEvent) => {
                    submitEvent.preventDefault();
                    cityssm.postJSON(`${shiftUrlPrefix}/doCreateShift`, formElement, (_responseJSON) => {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Shift created successfully!'
                        });
                        closeModalFunction();
                        loadShifts();
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
    const createShiftButton = document.querySelector('#button--createShift');
    if (createShiftButton !== null) {
        createShiftButton.addEventListener('click', openCreateShiftModal);
    }
    function openAddResourceModal(shift, viewMode) {
        cityssm.openHtmlModal('shifts-builder-addResource', {
            onshow(modalElement) {
                const shiftTypeElement = modalElement.querySelector('#builderAddResource--shiftType');
                const shiftNumberElement = modalElement.querySelector('#builderAddResource--shiftNumber');
                const shiftTimeElement = modalElement.querySelector('#builderAddResource--shiftTime');
                const supervisorElement = modalElement.querySelector('#builderAddResource--supervisor');
                shiftTypeElement.textContent = shift.shiftTypeDataListItem ?? 'Shift';
                shiftNumberElement.textContent = `#${shift.shiftId}`;
                shiftTimeElement.textContent = shift.shiftTimeDataListItem ?? '';
                supervisorElement.textContent =
                    shift.supervisorLastName === null
                        ? 'None'
                        : `${shift.supervisorLastName}, ${shift.supervisorFirstName}`;
                const tabsElement = modalElement.querySelector('#builderAddResource--tabs');
                tabsElement.innerHTML = '';
                if (viewMode === 'employees') {
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
                    const employeesContent = modalElement.querySelector('#builderAddResource--tabContent-employees');
                    employeesContent.classList.remove('is-hidden');
                    loadAvailableEmployeesForModal(modalElement, shift);
                }
                else {
                    const workOrdersTab = document.createElement('li');
                    workOrdersTab.className = 'is-active';
                    const workOrdersLink = document.createElement('a');
                    workOrdersLink.href = '#';
                    workOrdersLink.textContent = 'Work Orders';
                    workOrdersLink.dataset.tab = 'workOrders';
                    workOrdersTab.append(workOrdersLink);
                    tabsElement.append(workOrdersTab);
                    const workOrdersContent = modalElement.querySelector('#builderAddResource--tabContent-workOrders');
                    workOrdersContent.classList.remove('is-hidden');
                }
                tabsElement.addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.tagName === 'A' && target.dataset.tab !== undefined) {
                        event.preventDefault();
                        const allTabs = tabsElement.querySelectorAll('li');
                        for (const tab of allTabs) {
                            tab.classList.remove('is-active');
                        }
                        target.parentElement?.classList.add('is-active');
                        const allContent = modalElement.querySelectorAll('[id^="builderAddResource--tabContent-"]');
                        for (const content of allContent) {
                            content.classList.add('is-hidden');
                        }
                        const selectedContent = modalElement.querySelector(`#builderAddResource--tabContent-${target.dataset.tab}`);
                        selectedContent.classList.remove('is-hidden');
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
                                break;
                            }
                        }
                    }
                });
                setupFilterListeners(modalElement);
                const searchButton = modalElement.querySelector('#builderAddResource--searchWorkOrders');
                const workOrderFilter = modalElement.querySelector('#builderAddResource--workOrderFilter');
                searchButton.addEventListener('click', () => {
                    searchWorkOrders(modalElement, workOrderFilter.value);
                });
                workOrderFilter.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        searchWorkOrders(modalElement, workOrderFilter.value);
                    }
                });
                const addButton = modalElement.querySelector('#builderAddResource--addButton');
                addButton.addEventListener('click', () => {
                    addSelectedResources(modalElement, shift.shiftId);
                });
                const successMessage = modalElement.querySelector('#builderAddResource--successMessage');
                const deleteButton = successMessage.querySelector('.delete');
                deleteButton?.addEventListener('click', () => {
                    successMessage.classList.add('is-hidden');
                });
            },
            onshown() {
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
        });
    }
    function loadAvailableEquipmentForModal(modalElement, shift) {
        const shiftDateString = shiftDateElement.value;
        cityssm.postJSON(`${shiftUrlPrefix}/doGetAvailableResources`, { shiftDateString }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            const shiftEquipmentNumbers = new Set(shift.equipment.map((equipmentEntry) => equipmentEntry.equipmentNumber));
            const availableEquipment = responseJSON.equipment.filter((equipmentEntry) => !shiftEquipmentNumbers.has(equipmentEntry.equipmentNumber));
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
        });
    }
    function loadAvailableCrewsForModal(modalElement, shift) {
        const shiftDateString = shiftDateElement.value;
        cityssm.postJSON(`${shiftUrlPrefix}/doGetAvailableResources`, { shiftDateString }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
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
        const employeeFilter = modalElement.querySelector('#builderAddResource--employeeFilter');
        employeeFilter?.addEventListener('input', () => {
            filterCheckboxes(modalElement, '#builderAddResource--employeeList', employeeFilter.value);
        });
        const equipmentFilter = modalElement.querySelector('#builderAddResource--equipmentFilter');
        equipmentFilter?.addEventListener('input', () => {
            filterCheckboxes(modalElement, '#builderAddResource--equipmentList', equipmentFilter.value);
        });
        const crewFilter = modalElement.querySelector('#builderAddResource--crewFilter');
        crewFilter?.addEventListener('input', () => {
            filterCheckboxes(modalElement, '#builderAddResource--crewList', crewFilter.value);
        });
    }
    function filterCheckboxes(modalElement, containerSelector, filterText) {
        const container = modalElement.querySelector(containerSelector);
        if (container === null) {
            return;
        }
        const labels = container.querySelectorAll('label.checkbox');
        if (labels.length === 0) {
            return;
        }
        const lowerFilter = filterText.toLowerCase();
        for (const label of labels) {
            const labelElement = label;
            const text = (label.textContent ?? '').toLowerCase();
            labelElement.classList.toggle('is-hidden', !text.includes(lowerFilter));
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
        let processedCount = 0;
        let successCount = 0;
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
                    }, (_response) => {
                        processedCount += 1;
                        successCount += 1;
                        checkbox.checked = false;
                        if (processedCount === totalToAdd) {
                            successText.textContent = `Successfully added ${successCount} resource(s) to the shift.`;
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
                    }, (_response) => {
                        processedCount += 1;
                        successCount += 1;
                        checkbox.checked = false;
                        if (processedCount === totalToAdd) {
                            successText.textContent = `Successfully added ${successCount} resource(s) to the shift.`;
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
                    }, (_response) => {
                        processedCount += 1;
                        successCount += 1;
                        checkbox.checked = false;
                        if (processedCount === totalToAdd) {
                            successText.textContent = `Successfully added ${successCount} resource(s) to the shift.`;
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
                        processedCount += 1;
                        if (response.success) {
                            successCount += 1;
                            checkbox.checked = false;
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'warning',
                                message: response.errorMessage ?? 'Failed to add work order.',
                                title: 'Could Not Add Resource'
                            });
                        }
                        if (processedCount === totalToAdd) {
                            successText.textContent = `Successfully added ${successCount} of ${totalToAdd} resource(s) to the shift.`;
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
    function getResourceCounts() {
        return {
            employees: document.querySelectorAll('#available--employees .available-items > div[data-employee-number]').length,
            equipment: document.querySelectorAll('#available--equipment .available-items > div[data-equipment-number]').length,
            crews: document.querySelectorAll('#available--crews .available-items > div[data-crew-id]').length
        };
    }
    function setupResourceFilter() {
        const filterInput = document.querySelector('#availableResources--filter');
        if (filterInput === null)
            return;
        filterInput.addEventListener('input', () => {
            const filterText = filterInput.value.toLowerCase();
            const allResourceItems = document.querySelectorAll('#container--availableResources .available-items > div');
            let employeesVisible = 0;
            let equipmentVisible = 0;
            let crewsVisible = 0;
            for (const item of allResourceItems) {
                const text = item.textContent.toLowerCase();
                const isVisible = text.includes(filterText);
                if (isVisible) {
                    item.style.display = '';
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
            const employeesCountTag = document.querySelector('#employees-count');
            const equipmentCountTag = document.querySelector('#equipment-count');
            const crewsCountTag = document.querySelector('#crews-count');
            const totals = getResourceCounts();
            if (filterText === '') {
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
    function openCreateStandaloneAdhocTaskModal() {
        cityssm.postJSON(`${shiftUrlPrefix}/doGetAdhocTaskTypes`, {}, (typesResponse) => {
            if (!typesResponse.success) {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error',
                    message: 'Failed to load task types.'
                });
                return;
            }
            const adhocTaskTypes = typesResponse.adhocTaskTypes ?? [];
            cityssm.openHtmlModal('shifts-createAdhocTask', {
                onshow(modalElement) {
                    modalElement.querySelector('input[name="shiftId"]')?.remove();
                    modalElement
                        .querySelector('[name="shiftAdhocTaskNote"]')
                        ?.closest('.field')
                        ?.remove();
                    const taskTypeSelect = modalElement.querySelector('#createAdhocTask--adhocTaskTypeDataListItemId');
                    while (taskTypeSelect.options.length > 1) {
                        taskTypeSelect.remove(1);
                    }
                    for (const taskType of adhocTaskTypes) {
                        const option = document.createElement('option');
                        option.value = taskType.dataListItemId.toString();
                        option.textContent = taskType.dataListItem;
                        taskTypeSelect.append(option);
                    }
                    const defaultCityProvince = shiftLog.defaultCityProvince;
                    modalElement.querySelector('#createAdhocTask--locationCityProvince').value = defaultCityProvince;
                    modalElement.querySelector('#createAdhocTask--fromLocationCityProvince').value = defaultCityProvince;
                    modalElement.querySelector('#createAdhocTask--toLocationCityProvince').value = defaultCityProvince;
                },
                onshown(modalElement, closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    const formElement = modalElement.querySelector('form');
                    const dueDateInput = modalElement.querySelector('#createAdhocTask--taskDueDateTimeString');
                    if (dueDateInput && flatpickr !== undefined) {
                        flatpickr(dueDateInput, {
                            allowInput: true,
                            enableTime: true,
                            minuteIncrement: 15,
                            nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
                            prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
                        });
                    }
                    if (L !== undefined) {
                        const initMap = (mapId, latInput, lngInput) => {
                            const mapElement = modalElement.querySelector(`#${mapId}`);
                            if (!mapElement)
                                return;
                            const defaultLat = shiftLog.defaultLatitude || 43.65;
                            const defaultLng = shiftLog.defaultLongitude || -79.38;
                            const map = new L.Map(mapId).setView([defaultLat, defaultLng], 13);
                            new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            }).addTo(map);
                            let marker = null;
                            map.on('click', (event) => {
                                const lat = event.latlng.lat;
                                const lng = event.latlng.lng;
                                if (latInput)
                                    latInput.value = lat.toFixed(7);
                                if (lngInput)
                                    lngInput.value = lng.toFixed(7);
                                if (marker)
                                    map.removeLayer(marker);
                                marker = new L.Marker([lat, lng]).addTo(map);
                            });
                        };
                        initMap('map--createAdhocTask--location', modalElement.querySelector('#createAdhocTask--locationLatitude'), modalElement.querySelector('#createAdhocTask--locationLongitude'));
                        initMap('map--createAdhocTask--fromLocation', modalElement.querySelector('#createAdhocTask--fromLocationLatitude'), modalElement.querySelector('#createAdhocTask--fromLocationLongitude'));
                        initMap('map--createAdhocTask--toLocation', modalElement.querySelector('#createAdhocTask--toLocationLatitude'), modalElement.querySelector('#createAdhocTask--toLocationLongitude'));
                    }
                    formElement.addEventListener('submit', (formEvent) => {
                        formEvent.preventDefault();
                        cityssm.postJSON(`${shiftUrlPrefix}/doCreateStandaloneAdhocTask`, formEvent.currentTarget, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
                            if (responseJSON.success) {
                                bulmaJS.alert({
                                    contextualColorName: 'success',
                                    title: 'Success',
                                    message: 'Ad hoc task created successfully.'
                                });
                                closeModalFunction();
                                loadAvailableResources();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Error Creating Task',
                                    message: responseJSON.errorMessage ??
                                        'An unknown error occurred.'
                                });
                            }
                        });
                    });
                    modalElement.querySelector('#createAdhocTask--adhocTaskTypeDataListItemId')?.focus();
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        });
    }
    function openEditCrewNoteModal(shiftId, crew) {
        let closeModalFunction;
        cityssm.openHtmlModal('shifts-editCrewNote', {
            onshow(modalElement) {
                const formElement = modalElement.querySelector('#form--editCrewNote');
                formElement.querySelector('[name="shiftId"]').value = shiftId.toString();
                formElement.querySelector('[name="crewId"]').value = crew.crewId.toString();
                formElement.querySelector('[name="shiftCrewNote"]').value = crew.shiftCrewNote;
                formElement.addEventListener('submit', (submitEvent) => {
                    submitEvent.preventDefault();
                    cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShiftCrewNote`, formElement, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Crew note updated successfully!'
                            });
                            closeModalFunction();
                            loadShifts();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: 'Failed to update crew note.',
                                title: 'Update Error'
                            });
                        }
                    });
                });
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                const textarea = modalElement.querySelector('[name="shiftCrewNote"]');
                textarea.focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditEmployeeCrewNoteModal(shiftId, employee, shiftCrews) {
        let closeModalFunction;
        cityssm.openHtmlModal('shifts-builder-editEmployeeCrewNote', {
            onshow(modalElement) {
                const formElement = modalElement.querySelector('#form--builderEditEmployeeCrewNote');
                formElement.querySelector('[name="shiftId"]').value = shiftId.toString();
                formElement.querySelector('[name="employeeNumber"]').value = employee.employeeNumber;
                modalElement.querySelector('#builderEditEmployeeCrewNote--employeeName').value =
                    `${employee.lastName}, ${employee.firstName} (#${employee.employeeNumber})`;
                const crewSelect = formElement.querySelector('[name="crewId"]');
                crewSelect.innerHTML = '<option value="">(None)</option>';
                for (const crew of shiftCrews) {
                    const option = document.createElement('option');
                    option.value = crew.crewId.toString();
                    option.textContent = crew.crewName;
                    if (employee.crewId === crew.crewId) {
                        option.selected = true;
                    }
                    crewSelect.append(option);
                }
                ;
                formElement.querySelector('[name="shiftEmployeeNote"]').value = employee.shiftEmployeeNote;
                formElement.addEventListener('submit', (submitEvent) => {
                    submitEvent.preventDefault();
                    const formData = new FormData(formElement);
                    const crewId = formData.get('crewId');
                    const shiftEmployeeNote = formData.get('shiftEmployeeNote');
                    cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShiftEmployee`, {
                        shiftId,
                        employeeNumber: employee.employeeNumber,
                        crewId: crewId === '' ? null : crewId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShiftEmployeeNote`, {
                                shiftId,
                                employeeNumber: employee.employeeNumber,
                                shiftEmployeeNote
                            }, (noteResponseJSON) => {
                                if (noteResponseJSON.success) {
                                    bulmaJS.alert({
                                        contextualColorName: 'success',
                                        message: 'Employee updated successfully!'
                                    });
                                    closeModalFunction();
                                    loadShifts();
                                }
                                else {
                                    bulmaJS.alert({
                                        contextualColorName: 'warning',
                                        message: 'Crew updated but failed to update note.',
                                        title: 'Partial Update'
                                    });
                                    closeModalFunction();
                                    loadShifts();
                                }
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: 'Failed to update employee.',
                                title: 'Update Error'
                            });
                        }
                    });
                });
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                modalElement.querySelector('[name="crewId"]').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditEquipmentEmployeeNoteModal(shiftId, equipment, shiftEmployees) {
        let closeModalFunction;
        cityssm.openHtmlModal('shifts-builder-editEquipmentEmployeeNote', {
            onshow(modalElement) {
                const formElement = modalElement.querySelector('#form--builderEditEquipmentEmployeeNote');
                formElement.querySelector('[name="shiftId"]').value = shiftId.toString();
                formElement.querySelector('[name="equipmentNumber"]').value = equipment.equipmentNumber;
                modalElement.querySelector('#builderEditEquipmentEmployeeNote--equipmentName').value = `${equipment.equipmentName} (#${equipment.equipmentNumber})`;
                const employeeSelect = formElement.querySelector('[name="employeeNumber"]');
                employeeSelect.innerHTML = '<option value="">(None)</option>';
                for (const employee of shiftEmployees) {
                    const option = document.createElement('option');
                    option.value = employee.employeeNumber;
                    option.textContent = `${employee.lastName}, ${employee.firstName}`;
                    if (equipment.employeeNumber === employee.employeeNumber) {
                        option.selected = true;
                    }
                    employeeSelect.append(option);
                }
                ;
                formElement.querySelector('[name="shiftEquipmentNote"]').value = equipment.shiftEquipmentNote;
                formElement.addEventListener('submit', (submitEvent) => {
                    submitEvent.preventDefault();
                    const formData = new FormData(formElement);
                    const employeeNumber = formData.get('employeeNumber');
                    const shiftEquipmentNote = formData.get('shiftEquipmentNote');
                    cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShiftEquipment`, {
                        shiftId,
                        equipmentNumber: equipment.equipmentNumber,
                        employeeNumber: employeeNumber === '' ? null : employeeNumber
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShiftEquipmentNote`, {
                                shiftId,
                                equipmentNumber: equipment.equipmentNumber,
                                shiftEquipmentNote
                            }, (noteResponseJSON) => {
                                if (noteResponseJSON.success) {
                                    bulmaJS.alert({
                                        contextualColorName: 'success',
                                        message: 'Equipment updated successfully!'
                                    });
                                    closeModalFunction();
                                    loadShifts();
                                }
                                else {
                                    bulmaJS.alert({
                                        contextualColorName: 'warning',
                                        message: 'Employee assignment updated but failed to update note.',
                                        title: 'Partial Update'
                                    });
                                    closeModalFunction();
                                    loadShifts();
                                }
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: responseJSON.message ?? 'Failed to update equipment.',
                                title: 'Update Error'
                            });
                        }
                    });
                });
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                modalElement.querySelector('[name="employeeNumber"]').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditWorkOrderNoteModal(shiftId, workOrder) {
        let closeModalFunction;
        cityssm.openHtmlModal('shifts-editWorkOrderNote', {
            onshow(modalElement) {
                const formElement = modalElement.querySelector('#editWorkOrderNote--form');
                formElement.querySelector('[name="shiftId"]').value = shiftId.toString();
                formElement.querySelector('[name="workOrderId"]').value = workOrder.workOrderId.toString();
                formElement.querySelector('[name="shiftWorkOrderNote"]').value = workOrder.shiftWorkOrderNote;
                formElement.addEventListener('submit', (submitEvent) => {
                    submitEvent.preventDefault();
                    cityssm.postJSON(`${shiftUrlPrefix}/doUpdateShiftWorkOrderNote`, formElement, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Work order note updated successfully!'
                            });
                            closeModalFunction();
                            loadShifts();
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: responseJSON.errorMessage ??
                                    'Failed to update work order note.',
                                title: 'Update Error'
                            });
                        }
                    });
                });
            },
            onshown(modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
                modalElement.querySelector('[name="shiftWorkOrderNote"]').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    setupResourceCollapsibles();
    setupResourceFilter();
    loadShifts();
})();
