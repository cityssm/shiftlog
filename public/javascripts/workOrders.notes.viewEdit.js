"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var workOrderFormElement = document.querySelector('#form--workOrder');
    var workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Notes functionality
     */
    var notesContainerElement = document.querySelector('#container--notes');
    if (notesContainerElement !== null) {
        function truncateText(text, maxLength) {
            if (text.length <= maxLength) {
                return text;
            }
            return "".concat(text.slice(0, maxLength), "\u2026");
        }
        function renderNotes(notes) {
            // Update notes count
            var notesCountElement = document.querySelector('#notesCount');
            if (notesCountElement !== null) {
                notesCountElement.textContent = notes.length.toString();
            }
            if (notes.length === 0) {
                notesContainerElement.innerHTML = /* html */ "\n          <div class=\"message is-info\">\n            <p class=\"message-body\">No notes have been added yet.</p>\n          </div>\n        ";
                return;
            }
            notesContainerElement.innerHTML = '';
            var _loop_1 = function (note) {
                var noteElement = document.createElement('div');
                noteElement.className = 'box';
                var canEdit = exports.shiftLog.userCanManageWorkOrders ||
                    note.recordCreate_userName === exports.shiftLog.userName;
                var truncatedText = truncateText(note.noteText, 200);
                var needsExpand = note.noteText.length > 200;
                // eslint-disable-next-line no-unsanitized/property
                noteElement.innerHTML = /* html */ "\n          <article class=\"media\">\n            <div class=\"media-content\">\n              <div class=\"content\">\n                <p>\n                  <strong>".concat(cityssm.escapeHTML(note.recordCreate_userName), "</strong>\n                  <small>").concat(cityssm.dateToString(new Date(note.recordCreate_dateTime)), "</small>\n                  ").concat(note.recordUpdate_dateTime === note.recordCreate_dateTime
                    ? ''
                    : "<small class=\"has-text-grey\">(edited)</small>", "\n                  <br />\n                  <span class=\"note-text\">").concat(cityssm.escapeHTML(truncatedText), "</span>\n                  ").concat(needsExpand
                    ? "<a href=\"#\" class=\"view-full-note\" data-note-sequence=\"".concat(note.noteSequence, "\">View Full Note</a>")
                    : '', "\n                </p>\n              </div>\n              ").concat(canEdit
                    ? /* html */ "\n                    <nav class=\"level is-mobile\">\n                      <div class=\"level-left\">\n                        <a class=\"level-item edit-note\" data-note-sequence=\"".concat(note.noteSequence, "\">\n                          <span class=\"icon is-small\"><i class=\"fa-solid fa-edit\"></i></span>\n                        </a>\n                        <a class=\"level-item delete-note\" data-note-sequence=\"").concat(note.noteSequence, "\">\n                          <span class=\"icon is-small has-text-danger\"><i class=\"fa-solid fa-trash\"></i></span>\n                        </a>\n                      </div>\n                    </nav>\n                  ")
                    : '', "\n            </div>\n          </article>\n        ");
                // Add event listeners
                if (needsExpand) {
                    var viewFullLink = noteElement.querySelector('.view-full-note');
                    viewFullLink.addEventListener('click', function (event) {
                        event.preventDefault();
                        showFullNoteModal(note);
                    });
                }
                if (canEdit) {
                    var editLink = noteElement.querySelector('.edit-note');
                    editLink.addEventListener('click', function (event) {
                        event.preventDefault();
                        showEditNoteModal(note);
                    });
                    var deleteLink = noteElement.querySelector('.delete-note');
                    deleteLink.addEventListener('click', function (event) {
                        event.preventDefault();
                        deleteNote(note.noteSequence);
                    });
                }
                notesContainerElement.append(noteElement);
            };
            for (var _i = 0, notes_1 = notes; _i < notes_1.length; _i++) {
                var note = notes_1[_i];
                _loop_1(note);
            }
        }
        function showFullNoteModal(note) {
            var modalElement = document.createElement('div');
            modalElement.className = 'modal is-active';
            modalElement.innerHTML = /* html */ "\n        <div class=\"modal-background\"></div>\n        <div class=\"modal-card\">\n          <header class=\"modal-card-head\">\n            <p class=\"modal-card-title\">Full Note</p>\n            <button class=\"delete\" aria-label=\"close\"></button>\n          </header>\n          <section class=\"modal-card-body\">\n            <p><strong>".concat(cityssm.escapeHTML(note.recordCreate_userName), "</strong></p>\n            <p><small>").concat(cityssm.dateToString(new Date(note.recordCreate_dateTime)), "</small></p>\n            <div class=\"content mt-3\">\n              <p style=\"white-space: pre-wrap;\">").concat(cityssm.escapeHTML(note.noteText), "</p>\n            </div>\n          </section>\n          <footer class=\"modal-card-foot\">\n            <button class=\"button close-modal\">Close</button>\n          </footer>\n        </div>\n      ");
            document.body.append(modalElement);
            var closeButtons = modalElement.querySelectorAll('.delete, .close-modal, .modal-background');
            for (var _i = 0, closeButtons_1 = closeButtons; _i < closeButtons_1.length; _i++) {
                var button = closeButtons_1[_i];
                button.addEventListener('click', function () {
                    modalElement.remove();
                });
            }
        }
        function showEditNoteModal(note) {
            var closeModalFunction;
            function doUpdateNote(submitEvent) {
                submitEvent.preventDefault();
                var formElement = submitEvent.currentTarget;
                cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doUpdateWorkOrderNote"), formElement, function (responseJSON) {
                    if (responseJSON.success) {
                        closeModalFunction();
                        loadNotes();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to update note.'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-editNote', {
                onshow: function (modalElement) {
                    ;
                    modalElement.querySelector('#editWorkOrderNote--workOrderId').value = workOrderId;
                    modalElement.querySelector('#editWorkOrderNote--noteSequence').value = note.noteSequence.toString();
                    modalElement.querySelector('#editWorkOrderNote--noteText').value = note.noteText;
                },
                onshown: function (modalElement, _closeModalFunction) {
                    var _a;
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    (_a = modalElement
                        .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateNote);
                },
                onremoved: function () {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function showAddNoteModal() {
            var closeModalFunction;
            function doAddNote(submitEvent) {
                submitEvent.preventDefault();
                var formElement = submitEvent.currentTarget;
                cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doCreateWorkOrderNote"), formElement, function (responseJSON) {
                    if (responseJSON.success) {
                        closeModalFunction();
                        formElement.reset();
                        loadNotes();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to add note.'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-addNote', {
                onshow: function (modalElement) {
                    ;
                    modalElement.querySelector('#addWorkOrderNote--workOrderId').value = workOrderId;
                },
                onshown: function (modalElement, _closeModalFunction) {
                    var _a;
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    (_a = modalElement
                        .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddNote);
                    modalElement.querySelector('#addWorkOrderNote--noteText').focus();
                },
                onremoved: function () {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteNote(noteSequence) {
            bulmaJS.confirm({
                contextualColorName: 'danger',
                title: 'Delete Note',
                message: 'Are you sure you want to delete this note?',
                okButton: {
                    text: 'Delete',
                    callbackFunction: function () {
                        cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doDeleteWorkOrderNote"), {
                            workOrderId: workOrderId,
                            noteSequence: noteSequence
                        }, function (responseJSON) {
                            if (responseJSON.success) {
                                loadNotes();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: 'Failed to delete note.'
                                });
                            }
                        });
                    }
                }
            });
        }
        function loadNotes() {
            cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/").concat(workOrderId, "/doGetWorkOrderNotes"), {}, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderNotes(responseJSON.notes);
                }
            });
        }
        // Add note button
        var addNoteButton = document.querySelector('#button--addNote');
        if (addNoteButton !== null) {
            addNoteButton.addEventListener('click', function () {
                showAddNoteModal();
            });
        }
        // Load notes initially
        loadNotes();
    }
})();
