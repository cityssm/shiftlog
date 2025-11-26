(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}`;
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
     * Requestor Name Datalist
     */
    const requestorNameInput = workOrderFormElement.querySelector('#workOrder--requestorName');
    const requestorContactInfoInput = workOrderFormElement.querySelector('#workOrder--requestorContactInfo');
    const requestorDatalist = document.querySelector('#datalist--requestorNames');
    if (requestorDatalist !== null) {
        let requestorSearchString = '';
        let requestorsData = [];
        requestorNameInput.addEventListener('keyup', () => {
            const newSearchString = requestorNameInput.value.trim().slice(0, 3);
            if (newSearchString.length >= 3 &&
                newSearchString !== requestorSearchString) {
                requestorSearchString = newSearchString;
                // Load requestor suggestions
                cityssm.postJSON(`${urlPrefix}/doGetRequestorSuggestions`, {
                    searchString: requestorSearchString
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success && responseJSON.requestors) {
                        requestorsData = responseJSON.requestors;
                        for (const requestor of responseJSON.requestors) {
                            const option = document.createElement('option');
                            option.value = requestor.requestorName;
                            option.textContent =
                                requestor.requestorName +
                                    (requestor.requestorContactInfo
                                        ? ` (${requestor.requestorContactInfo})`
                                        : '');
                            option.dataset.contactInfo =
                                requestor.requestorContactInfo ?? '';
                            requestorDatalist.append(option);
                        }
                    }
                });
            }
        });
        // Handle requestor name selection
        requestorNameInput.addEventListener('change', () => {
            const selectedName = requestorNameInput.value;
            const matchingRequestor = requestorsData.find((possibleRequestor) => possibleRequestor.requestorName === selectedName);
            if (matchingRequestor?.requestorContactInfo !== undefined) {
                // Check if contact info is already set
                if (requestorContactInfoInput.value !== '' &&
                    requestorContactInfoInput.value !==
                        matchingRequestor.requestorContactInfo) {
                    bulmaJS.confirm({
                        title: 'Update Requestor Contact Info?',
                        message: `The contact info for "${selectedName}" is "${matchingRequestor.requestorContactInfo}". Do you want to update the current contact info?`,
                        okButton: {
                            text: 'Update',
                            callbackFunction: () => {
                                requestorContactInfoInput.value =
                                    matchingRequestor.requestorContactInfo ?? '';
                            }
                        }
                    });
                }
                else {
                    requestorContactInfoInput.value =
                        matchingRequestor.requestorContactInfo;
                }
            }
        });
    }
    /*
     * Location Address Datalist
     */
    const locationAddress1Input = workOrderFormElement.querySelector('#workOrder--locationAddress1');
    const locationAddress2Input = workOrderFormElement.querySelector('#workOrder--locationAddress2');
    const locationCityProvinceInput = workOrderFormElement.querySelector('#workOrder--locationCityProvince');
    const locationLatitudeInput = workOrderFormElement.querySelector('#workOrder--locationLatitude');
    const locationLongitudeInput = workOrderFormElement.querySelector('#workOrder--locationLongitude');
    const locationDatalist = document.querySelector('#datalist--locations');
    if (locationDatalist !== null) {
        let locationSearchString = '';
        let locationsData = [];
        locationAddress1Input.addEventListener('keyup', () => {
            const newSearchString = locationAddress1Input.value.trim().slice(0, 3);
            if (newSearchString.length >= 3 &&
                newSearchString !== locationSearchString) {
                locationSearchString = newSearchString;
                // Load location suggestions
                cityssm.postJSON(`${urlPrefix}/doGetLocationSuggestions`, { searchString: locationSearchString }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success && responseJSON.locations) {
                        locationsData = responseJSON.locations;
                        locationDatalist.replaceChildren();
                        for (const location of responseJSON.locations) {
                            const option = document.createElement('option');
                            option.value = location.address1;
                            option.dataset.locationId = location.locationId.toString();
                            option.dataset.address2 = location.address2;
                            option.dataset.cityProvince = location.cityProvince;
                            option.dataset.latitude =
                                typeof location.latitude === 'number'
                                    ? location.latitude.toString()
                                    : '';
                            option.dataset.longitude =
                                typeof location.longitude === 'number'
                                    ? location.longitude.toString()
                                    : '';
                            locationDatalist.append(option);
                        }
                    }
                });
            }
        });
        // Handle location selection
        locationAddress1Input.addEventListener('change', () => {
            const selectedAddress = locationAddress1Input.value;
            const matchingLocation = locationsData.find((possibleLocation) => possibleLocation.locationName === selectedAddress ||
                possibleLocation.address1 === selectedAddress);
            if (matchingLocation !== undefined) {
                // Check if other location fields are already set
                const hasExistingData = locationAddress2Input.value !== '' ||
                    locationCityProvinceInput.value !== '' ||
                    locationLatitudeInput.value !== '' ||
                    locationLongitudeInput.value !== '';
                if (hasExistingData) {
                    bulmaJS.confirm({
                        title: 'Update Location Information?',
                        message: 'Do you want to update the location details with the selected address?',
                        okButton: {
                            text: 'Update',
                            callbackFunction: () => {
                                applyLocationData(matchingLocation);
                            }
                        }
                    });
                }
                else {
                    applyLocationData(matchingLocation);
                }
            }
        });
        function applyLocationData(location) {
            locationAddress2Input.value = location.address2;
            locationCityProvinceInput.value = location.cityProvince;
            if (location.latitude !== null && location.latitude !== undefined) {
                locationLatitudeInput.value = location.latitude.toString();
            }
            if (location.longitude !== null && location.longitude !== undefined) {
                locationLongitudeInput.value = location.longitude.toString();
            }
            // Update map if coordinates are set
            const changeEvent = new Event('change');
            locationLatitudeInput.dispatchEvent(changeEvent);
        }
    }
    /*
     * Set up date-time pickers
     */
    const dateTimePickerOptions = {
        allowInput: true,
        enableTime: true,
        nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
        prevArrow: '<i class="fa-solid fa-chevron-left"></i>',
        minuteIncrement: 1
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
        minDate: workOrderOpenDateTimeStringElement.valueAsDate ?? '',
        onOpen: () => {
            workOrderCloseDateTimePicker.set('maxDate', new Date());
        }
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
     * Set Close Time to Now Button
     */
    document
        .querySelector('#button--setCloseTimeNow')
        ?.addEventListener('click', () => {
        const now = new Date();
        workOrderCloseDateTimePicker.set('maxDate', now);
        workOrderCloseDateTimePicker.setDate(now, true);
    });
    /*
     * Set up map for location picker
     */
    const mapPickerElement = document.querySelector('#map--locationPicker');
    if (mapPickerElement !== null) {
        const latitudeInput = workOrderFormElement.querySelector('#workOrder--locationLatitude');
        const longitudeInput = workOrderFormElement.querySelector('#workOrder--locationLongitude');
        // Default to SSM or use existing coordinates
        let defaultLat = shiftLog.defaultLatitude;
        let defaultLng = shiftLog.defaultLongitude;
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
