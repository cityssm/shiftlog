"use strict";
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    var locationsContainerElement = document.querySelector('#container--locations');
    // Default map coordinates (Sault Ste. Marie)
    var DEFAULT_MAP_ZOOM = 13;
    var DETAIL_MAP_ZOOM = 15;
    // Pagination settings
    var ITEMS_PER_PAGE = 10;
    var currentPage = 1;
    var currentFilteredLocations = exports.locations;
    function pageSelect(pageNumber) {
        currentPage = pageNumber;
        renderLocationsWithPagination(currentFilteredLocations);
    }
    /**
     * Initialize a Leaflet map picker for location coordinate selection
     */
    function initializeLocationMapPicker(mapElementId, latitudeInput, longitudeInput) {
        // Use existing coordinates or default to SSM
        var defaultLat = shiftLog.defaultLatitude;
        var defaultLng = shiftLog.defaultLongitude;
        var defaultZoom = DEFAULT_MAP_ZOOM;
        if (latitudeInput.value !== '' && longitudeInput.value !== '') {
            defaultLat = Number.parseFloat(latitudeInput.value);
            defaultLng = Number.parseFloat(longitudeInput.value);
            defaultZoom = DETAIL_MAP_ZOOM;
        }
        var map = new L.Map(mapElementId).setView([defaultLat, defaultLng], defaultZoom);
        new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        // eslint-disable-next-line unicorn/no-null
        var marker = null;
        // Add existing marker if coordinates are set
        if (latitudeInput.value !== '' && longitudeInput.value !== '') {
            marker = new L.Marker([defaultLat, defaultLng]).addTo(map);
        }
        // Handle map click to set coordinates
        map.on('click', function (event) {
            var lat = event.latlng.lat;
            var lng = event.latlng.lng;
            latitudeInput.value = lat.toFixed(7);
            longitudeInput.value = lng.toFixed(7);
            if (marker !== null) {
                map.removeLayer(marker);
            }
            marker = new L.Marker([lat, lng]).addTo(map);
        });
        // Update map when coordinates are manually entered
        function updateMapFromInputs() {
            var lat = Number.parseFloat(latitudeInput.value);
            var lng = Number.parseFloat(longitudeInput.value);
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
                map.setView([lat, lng], DETAIL_MAP_ZOOM);
            }
        }
        latitudeInput.addEventListener('change', updateMapFromInputs);
        longitudeInput.addEventListener('change', updateMapFromInputs);
    }
    function deleteLocation(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var locationId = buttonElement.dataset.locationId;
        if (locationId === undefined) {
            return;
        }
        var location = exports.locations.find(function (possibleLocation) { return possibleLocation.locationId === Number(locationId); });
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Location',
            message: "Are you sure you want to delete location \"".concat((_a = location === null || location === void 0 ? void 0 : location.address1) !== null && _a !== void 0 ? _a : '', "\"? This action cannot be undone."),
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Location',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteLocation"), {
                        locationId: locationId
                    }, function (responseJSON) {
                        var _a;
                        if (responseJSON.success) {
                            if (responseJSON.locations !== undefined) {
                                exports.locations = responseJSON.locations;
                                currentFilteredLocations = responseJSON.locations;
                                // Adjust current page if it becomes invalid after deletion
                                var totalPages = Math.ceil(responseJSON.locations.length / ITEMS_PER_PAGE);
                                if (currentPage > totalPages && totalPages > 0) {
                                    currentPage = totalPages;
                                }
                                renderLocationsWithPagination(responseJSON.locations);
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
                                message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editLocation(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var locationId = buttonElement.dataset.locationId;
        if (locationId === undefined) {
            return;
        }
        var location = exports.locations.find(function (possibleLocation) { return possibleLocation.locationId === Number(locationId); });
        if (location === undefined) {
            return;
        }
        var closeModalFunction;
        function doUpdateLocation(submitEvent) {
            submitEvent.preventDefault();
            var editForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateLocation"), editForm, function (responseJSON) {
                var _a;
                if (responseJSON.success) {
                    closeModalFunction();
                    if (responseJSON.locations !== undefined) {
                        exports.locations = responseJSON.locations;
                        currentFilteredLocations = responseJSON.locations;
                        // Keep the current page after updating
                        renderLocationsWithPagination(responseJSON.locations);
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
                        message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminLocations-edit', {
            onshow: function (modalElement) {
                var _a, _b, _c, _d;
                ;
                modalElement.querySelector('#editLocation--locationId').value = location.locationId.toString();
                modalElement.querySelector('#editLocation--address1').value = location.address1;
                modalElement.querySelector('#editLocation--address2').value = location.address2;
                modalElement.querySelector('#editLocation--cityProvince').value = location.cityProvince;
                modalElement.querySelector('#editLocation--latitude').value = (_b = (_a = location.latitude) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                modalElement.querySelector('#editLocation--longitude').value = (_d = (_c = location.longitude) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateLocation);
                // Initialize map picker
                var mapPickerElement = modalElement.querySelector('#map--editLocationPicker');
                if (mapPickerElement !== null) {
                    initializeLocationMapPicker('map--editLocationPicker', modalElement.querySelector('#editLocation--latitude'), modalElement.querySelector('#editLocation--longitude'));
                }
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function buildLocationRowElement(location) {
        var rowElement = document.createElement('tr');
        rowElement.dataset.locationId = location.locationId.toString();
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /* html */ "\n      <td class=\"has-text-centered has-width-1\">\n        ".concat(location.recordSync_isSynced
            ? /* html */ "\n              <span class=\"is-size-7 has-text-grey\" title=\"Synchronized\">\n                <i class=\"fa-solid fa-arrows-rotate\"></i>\n              </span>\n            "
            : '', "\n      </td>\n      <td>").concat(cityssm.escapeHTML(location.address1), "</td>\n      <td>").concat(cityssm.escapeHTML(location.address2), "</td>\n      <td>").concat(cityssm.escapeHTML(location.cityProvince), "</td>\n      <td class=\"has-text-centered\">\n        ").concat(location.latitude !== null && location.longitude !== null ? '<i class="fa-solid fa-check"></i>' : '-', "\n      </td>\n      <td class=\"has-text-right\">\n        <div class=\"buttons is-right\">\n          <button\n            class=\"button is-small is-info edit-location\"\n            data-location-id=\"").concat(location.locationId, "\"\n            title=\"Edit Location\"\n          >\n            <span class=\"icon is-small\">\n              <i class=\"fa-solid fa-pencil\"></i>\n            </span>\n            <span>Edit</span>\n          </button>\n          <button\n            class=\"button is-small is-danger delete-location\"\n            data-location-id=\"").concat(location.locationId, "\"\n            title=\"Delete Location\"\n          >\n            <span class=\"icon is-small\">\n              <i class=\"fa-solid fa-trash\"></i>\n            </span>\n            <span>Delete</span>\n          </button>\n        </div>\n      </td>\n    ");
        return rowElement;
    }
    function renderLocations(locations) {
        var _a;
        if (locations.length === 0) {
            locationsContainerElement.innerHTML = /* html */ "\n        <div class=\"message is-info\">\n          <div class=\"message-body\">\n            No locations available.\n          </div>\n        </div>\n      ";
            return;
        }
        var tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable has-sticky-header';
        tableElement.innerHTML = /* html */ "\n      <thead>\n        <tr>\n          <th>\n            <span class=\"is-sr-only\">Sync Status</span>\n          </th>\n          <th>Address Line 1</th>\n          <th>Address Line 2</th>\n          <th>City/Province</th>\n          <th class=\"has-text-centered\">Coordinates</th>\n          <th class=\"has-text-centered\">\n            <span class=\"is-sr-only\">Actions</span>\n          </th>\n        </tr>\n      </thead>\n      <tbody></tbody>\n    ";
        for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
            var location_1 = locations_1[_i];
            var rowElement = buildLocationRowElement(location_1);
            (_a = tableElement.querySelector('tbody')) === null || _a === void 0 ? void 0 : _a.append(rowElement);
        }
        // Add event listeners for edit buttons
        for (var _b = 0, _c = tableElement.querySelectorAll('.edit-location'); _b < _c.length; _b++) {
            var button = _c[_b];
            button.addEventListener('click', editLocation);
        }
        // Add event listeners for delete buttons
        for (var _d = 0, _e = tableElement.querySelectorAll('.delete-location'); _d < _e.length; _d++) {
            var button = _e[_d];
            button.addEventListener('click', deleteLocation);
        }
        locationsContainerElement.replaceChildren(tableElement);
    }
    /**
     * Render locations with pagination
     */
    function renderLocationsWithPagination(locations) {
        // Calculate pagination
        var startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        var endIndex = startIndex + ITEMS_PER_PAGE;
        var paginatedLocations = locations.slice(startIndex, endIndex);
        // Render table
        renderLocations(paginatedLocations);
        // Add pagination controls if needed
        if (locations.length > ITEMS_PER_PAGE) {
            var paginationControls = shiftLog.buildPaginationControls({
                totalCount: locations.length,
                currentPageOrOffset: currentPage,
                itemsPerPageOrLimit: ITEMS_PER_PAGE,
                clickHandler: pageSelect
            });
            locationsContainerElement.append(paginationControls);
        }
    }
    (_a = document
        .querySelector('#button--addLocation')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        var closeModalFunction;
        function doAddLocation(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddLocation"), addForm, function (responseJSON) {
                var _a;
                if (responseJSON.success) {
                    closeModalFunction();
                    addForm.reset();
                    if (responseJSON.locations !== undefined) {
                        exports.locations = responseJSON.locations;
                        currentFilteredLocations = responseJSON.locations;
                        currentPage = 1;
                        renderLocationsWithPagination(responseJSON.locations);
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
                        message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminLocations-add', {
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddLocation);
                modalElement.querySelector('#addLocation--cityProvince').value = exports.defaultCityProvince;
                modalElement.querySelector('#addLocation--address1').focus();
                // Initialize map picker
                var mapPickerElement = modalElement.querySelector('#map--addLocationPicker');
                if (mapPickerElement !== null) {
                    initializeLocationMapPicker('map--addLocationPicker', modalElement.querySelector('#addLocation--latitude'), modalElement.querySelector('#addLocation--longitude'));
                }
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderLocationsWithPagination(exports.locations);
    /*
     * Filter locations with debouncing
     */
    var filterInput = document.querySelector('#filter--locations');
    // eslint-disable-next-line unicorn/no-null
    var filterTimeout = null;
    if (filterInput !== null) {
        filterInput.addEventListener('input', function () {
            // Clear existing timeout
            if (filterTimeout !== null) {
                clearTimeout(filterTimeout);
            }
            // Set new timeout (debounce for 300ms)
            filterTimeout = setTimeout(function () {
                var filterText = filterInput.value.toLowerCase();
                if (filterText === '') {
                    currentFilteredLocations = exports.locations;
                    currentPage = 1;
                    renderLocationsWithPagination(exports.locations);
                }
                else {
                    var filteredLocations = exports.locations.filter(function (location) {
                        var searchText = "".concat(location.address1, " ").concat(location.address2, " ").concat(location.cityProvince).toLowerCase();
                        return searchText.includes(filterText);
                    });
                    currentFilteredLocations = filteredLocations;
                    currentPage = 1;
                    renderLocationsWithPagination(filteredLocations);
                }
            }, 300);
        });
    }
})();
//# sourceMappingURL=locations.admin.js.map