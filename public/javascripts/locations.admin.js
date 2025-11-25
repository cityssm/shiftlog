(() => {
    const shiftLog = exports.shiftLog;
    const locationsContainerElement = document.querySelector('#container--locations');
    function deleteLocation(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const locationId = buttonElement.dataset.locationId;
        if (locationId === undefined) {
            return;
        }
        const location = exports.locations.find((possibleLocation) => possibleLocation.locationId === Number(locationId));
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Location',
            message: `Are you sure you want to delete location "${location?.locationName ?? ''}"? This action cannot be undone.`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Location',
                callbackFunction() {
                    cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doDeleteLocation`, {
                        locationId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.locations !== undefined) {
                                exports.locations = responseJSON.locations;
                                renderLocations(responseJSON.locations);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Location Deleted',
                                message: 'Location has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Location',
                                message: responseJSON.message ?? 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editLocation(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const locationId = buttonElement.dataset.locationId;
        if (locationId === undefined) {
            return;
        }
        const location = exports.locations.find((possibleLocation) => possibleLocation.locationId === Number(locationId));
        if (location === undefined) {
            return;
        }
        let closeModalFunction;
        function doUpdateLocation(submitEvent) {
            submitEvent.preventDefault();
            const editForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doUpdateLocation`, editForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    if (responseJSON.locations !== undefined) {
                        exports.locations = responseJSON.locations;
                        renderLocations(responseJSON.locations);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Location Updated',
                        message: 'Location has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Location',
                        message: responseJSON.message ?? 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminLocations-edit', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#editLocation--locationId').value =
                    location.locationId.toString();
                modalElement.querySelector('#editLocation--locationName').value =
                    location.locationName;
                modalElement.querySelector('#editLocation--address1').value =
                    location.address1;
                modalElement.querySelector('#editLocation--address2').value =
                    location.address2;
                modalElement.querySelector('#editLocation--cityProvince').value =
                    location.cityProvince;
                modalElement.querySelector('#editLocation--latitude').value =
                    location.latitude?.toString() ?? '';
                modalElement.querySelector('#editLocation--longitude').value =
                    location.longitude?.toString() ?? '';
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateLocation);
                // Initialize map picker
                const mapPickerElement = modalElement.querySelector('#map--editLocationPicker');
                if (mapPickerElement !== null) {
                    const latitudeInput = modalElement.querySelector('#editLocation--latitude');
                    const longitudeInput = modalElement.querySelector('#editLocation--longitude');
                    // Default to SSM or use existing coordinates
                    let defaultLat = 46.5136;
                    let defaultLng = -84.3422;
                    let defaultZoom = 13;
                    if (latitudeInput.value !== '' && longitudeInput.value !== '') {
                        defaultLat = Number.parseFloat(latitudeInput.value);
                        defaultLng = Number.parseFloat(longitudeInput.value);
                        defaultZoom = 15;
                    }
                    const map = new L.Map('map--editLocationPicker').setView([defaultLat, defaultLng], defaultZoom);
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
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function buildLocationRowElement(location) {
        const rowElement = document.createElement('tr');
        rowElement.dataset.locationId = location.locationId.toString();
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /* html */ `
      <td>${cityssm.escapeHTML(location.locationName)}</td>
      <td>${cityssm.escapeHTML(location.address1)}</td>
      <td>${cityssm.escapeHTML(location.address2)}</td>
      <td>${cityssm.escapeHTML(location.cityProvince)}</td>
      <td class="has-text-centered">
        ${location.latitude !== null && location.longitude !== null ? '<i class="fa-solid fa-check"></i>' : '-'}
      </td>
      <td class="has-text-centered">
        <div class="buttons is-justify-content-center">
          <button
            class="button is-small is-info edit-location"
            data-location-id="${location.locationId}"
            title="Edit Location"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-pencil"></i>
            </span>
            <span>Edit</span>
          </button>
          <button
            class="button is-small is-danger delete-location"
            data-location-id="${location.locationId}"
            title="Delete Location"
          >
            Delete
          </button>
        </div>
      </td>
    `;
        return rowElement;
    }
    function renderLocations(locations) {
        if (locations.length === 0) {
            locationsContainerElement.innerHTML = '<p>No locations found.</p>';
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable has-sticky-header';
        tableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th>Location Name</th>
          <th>Address Line 1</th>
          <th>Address Line 2</th>
          <th>City/Province</th>
          <th class="has-text-centered">Coordinates</th>
          <th class="has-text-centered">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        for (const location of locations) {
            const rowElement = buildLocationRowElement(location);
            tableElement.querySelector('tbody')?.append(rowElement);
        }
        // Add event listeners for edit buttons
        for (const button of tableElement.querySelectorAll('.edit-location')) {
            button.addEventListener('click', editLocation);
        }
        // Add event listeners for delete buttons
        for (const button of tableElement.querySelectorAll('.delete-location')) {
            button.addEventListener('click', deleteLocation);
        }
        locationsContainerElement.replaceChildren(tableElement);
    }
    document
        .querySelector('#button--addLocation')
        ?.addEventListener('click', () => {
        let closeModalFunction;
        function doAddLocation(submitEvent) {
            submitEvent.preventDefault();
            const addForm = submitEvent.currentTarget;
            cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doAddLocation`, addForm, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    addForm.reset();
                    if (responseJSON.locations !== undefined) {
                        exports.locations = responseJSON.locations;
                        renderLocations(responseJSON.locations);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Location Added',
                        message: 'Location has been successfully added.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Location',
                        message: responseJSON.message ?? 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminLocations-add', {
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddLocation);
                modalElement.querySelector('#addLocation--locationName').focus();
                // Initialize map picker
                const mapPickerElement = modalElement.querySelector('#map--addLocationPicker');
                if (mapPickerElement !== null) {
                    const latitudeInput = modalElement.querySelector('#addLocation--latitude');
                    const longitudeInput = modalElement.querySelector('#addLocation--longitude');
                    // Default to SSM
                    const defaultLat = 46.5136;
                    const defaultLng = -84.3422;
                    const defaultZoom = 13;
                    const map = new L.Map('map--addLocationPicker').setView([defaultLat, defaultLng], defaultZoom);
                    new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);
                    // eslint-disable-next-line unicorn/no-null
                    let marker = null;
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
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderLocations(exports.locations);
    /*
     * Filter locations
     */
    const filterInput = document.querySelector('#filter--locations');
    if (filterInput !== null) {
        filterInput.addEventListener('input', () => {
            const filterText = filterInput.value.toLowerCase();
            if (filterText === '') {
                renderLocations(exports.locations);
            }
            else {
                const filteredLocations = exports.locations.filter((location) => {
                    const searchText = `${location.locationName} ${location.address1} ${location.address2} ${location.cityProvince}`.toLowerCase();
                    return searchText.includes(filterText);
                });
                renderLocations(filteredLocations);
            }
        });
    }
})();
