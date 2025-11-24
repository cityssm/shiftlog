(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = shiftLog.urlPrefix + '/' + shiftLog.workOrdersRouter;
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    const workOrderCloseDateTimeStringElement = workOrderFormElement.querySelector('#workOrder--workOrderCloseDateTimeString');
    const isCreate = workOrderId === '';
    function updateWorkOrder(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${urlPrefix}/${isCreate ? 'doCreateWorkOrder' : 'doUpdateWorkOrder'}`, workOrderFormElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                if (isCreate && responseJSON.workOrderId !== undefined) {
                    globalThis.location.href = shiftLog.buildWorkOrderURL(responseJSON.workOrderId, true);
                }
                else if (workOrderCloseDateTimeStringElement.value === '') {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Updated Successfully'
                    });
                }
                else {
                    globalThis.location.href = shiftLog.buildWorkOrderURL(Number(workOrderId));
                }
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Update Error',
                    message: responseJSON.errorMessage ?? 'An unknown error occurred.'
                });
            }
        });
    }
    workOrderFormElement.addEventListener('submit', updateWorkOrder);
    /*
     * Set up date-time pickers
     */
    const dateTimePickerOptions = {
        allowInput: true,
        enableTime: true,
        nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
        prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
    };
    const workOrderOpenDateTimeStringElement = workOrderFormElement.querySelector('#workOrder--workOrderOpenDateTimeString');
    const workOrderDueDateTimeStringElement = workOrderFormElement.querySelector('#workOrder--workOrderDueDateTimeString');
    const workOrderDueDateTimePicker = flatpickr(workOrderDueDateTimeStringElement, {
        ...dateTimePickerOptions,
        minDate: workOrderOpenDateTimeStringElement.valueAsDate ?? ''
    });
    const workOrderCloseDateTimePicker = flatpickr(workOrderCloseDateTimeStringElement, {
        ...dateTimePickerOptions,
        maxDate: new Date(),
        minDate: workOrderOpenDateTimeStringElement.valueAsDate ?? ''
    });
    flatpickr(workOrderOpenDateTimeStringElement, {
        ...dateTimePickerOptions,
        maxDate: new Date(),
        onChange: (selectedDates) => {
            if (selectedDates.length > 0) {
                const selectedDate = selectedDates[0];
                if (workOrderDueDateTimePicker.selectedDates.length > 0) {
                    const dueDate = workOrderDueDateTimePicker.selectedDates[0];
                    if (dueDate < selectedDate) {
                        bulmaJS.alert({
                            contextualColorName: 'warning',
                            message: 'Due Date/Time reset because it was before the Open Date/Time.'
                        });
                        workOrderDueDateTimePicker.setDate(selectedDate, true);
                    }
                }
                workOrderDueDateTimePicker.set('minDate', selectedDate);
                workOrderCloseDateTimePicker.set('minDate', selectedDate);
            }
        }
    });
    /*
     * Set up map for location picker
     */
    const mapPickerElement = document.querySelector('#map--locationPicker');
    if (mapPickerElement !== null) {
        const latitudeInput = workOrderFormElement.querySelector('#workOrder--locationLatitude');
        const longitudeInput = workOrderFormElement.querySelector('#workOrder--locationLongitude');
        // Default to SSM or use existing coordinates
        let defaultLat = 46.5136;
        let defaultLng = -84.3422;
        let defaultZoom = 13;
        if (latitudeInput.value !== '' && longitudeInput.value !== '') {
            defaultLat = Number.parseFloat(latitudeInput.value);
            defaultLng = Number.parseFloat(longitudeInput.value);
            defaultZoom = 15;
        }
        const map = new L.Map('map--locationPicker').setView([defaultLat, defaultLng], defaultZoom);
        new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        // eslint-disable-next-line unicorn/no-null
        let marker = null;
        if (latitudeInput.value !== '' && longitudeInput.value !== '') {
            marker = new L.Marker([defaultLat, defaultLng]).addTo(map);
        }
        map.on('click', (event) => {
            const lat = event.latlng.lat;
            const lng = event.latlng.lng;
            latitudeInput.value = lat.toFixed(7);
            longitudeInput.value = lng.toFixed(7);
            if (marker !== null) {
                map.removeLayer(marker);
            }
            marker = new L.Marker([lat, lng]).addTo(map);
        });
        // Update map when coordinates are manually entered
        function updateMapFromInputs() {
            const lat = Number.parseFloat(latitudeInput.value);
            const lng = Number.parseFloat(longitudeInput.value);
            if (!Number.isNaN(lat) &&
                !Number.isNaN(lng) &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180) {
                if (marker !== null) {
                    map.removeLayer(marker);
                }
                marker = new L.Marker([lat, lng]).addTo(map);
                map.setView([lat, lng], 15);
            }
        }
        latitudeInput.addEventListener('change', updateMapFromInputs);
        longitudeInput.addEventListener('change', updateMapFromInputs);
    }
    // View-only map
    const mapViewElement = document.querySelector('#map--locationView');
    if (mapViewElement !== null) {
        const lat = Number.parseFloat(mapViewElement.dataset.lat ?? '0');
        const lng = Number.parseFloat(mapViewElement.dataset.lng ?? '0');
        const map = new L.Map('map--locationView').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        new L.Marker([lat, lng]).addTo(map);
    }
    /*
     * Delete work order
     */
    const deleteWorkOrderButton = document.querySelector('#button--deleteWorkOrder');
    if (deleteWorkOrderButton !== null) {
        deleteWorkOrderButton.addEventListener('click', (event) => {
            event.preventDefault();
            bulmaJS.confirm({
                contextualColorName: 'danger',
                title: 'Delete Work Order',
                message: `Are you sure you want to delete this work order? This action cannot be undone.`,
                okButton: {
                    text: 'Delete Work Order',
                    callbackFunction: () => {
                        cityssm.postJSON(`${urlPrefix}/doDeleteWorkOrder`, {
                            workOrderId
                        }, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
                            if (responseJSON.success &&
                                responseJSON.redirectUrl !== undefined) {
                                globalThis.location.href = responseJSON.redirectUrl;
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Delete Error',
                                    message: responseJSON.errorMessage ?? 'An unknown error occurred.'
                                });
                            }
                        });
                    }
                }
            });
        });
    }
})();
