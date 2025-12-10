"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var workOrderFormElement = document.querySelector('#form--workOrder');
    var workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Attachments functionality
     */
    var attachmentsContainerElement = document.querySelector('#container--attachments');
    if (attachmentsContainerElement !== null) {
        function formatFileSize(bytes) {
            if (bytes === 0)
                return '0 Bytes';
            var k = 1024;
            var sizes = ['Bytes', 'KB', 'MB', 'GB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return "".concat(Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)), " ").concat(sizes[i]);
        }
        function getFileIcon(fileType) {
            if (fileType.startsWith('image/')) {
                return 'fa-file-image';
            }
            else if (fileType === 'application/pdf') {
                return 'fa-file-pdf';
            }
            else if (fileType.includes('word') || fileType.includes('document')) {
                return 'fa-file-word';
            }
            else if (fileType.includes('excel') ||
                fileType.includes('spreadsheet')) {
                return 'fa-file-excel';
            }
            else if (fileType.includes('zip') || fileType.includes('archive')) {
                return 'fa-file-archive';
            }
            else if (fileType.startsWith('text/')) {
                return 'fa-file-alt';
            }
            return 'fa-file';
        }
        function renderAttachments(attachments) {
            // Update attachments count
            var attachmentsCountElement = document.querySelector('#attachmentsCount');
            if (attachmentsCountElement !== null) {
                attachmentsCountElement.textContent = attachments.length.toString();
            }
            if (attachments.length === 0) {
                attachmentsContainerElement.innerHTML = /* html */ "\n          <div class=\"message is-info\">\n            <p class=\"message-body\">No attachments have been added yet.</p>\n          </div>\n        ";
                return;
            }
            attachmentsContainerElement.innerHTML = '';
            var _loop_1 = function (attachment) {
                var attachmentElement = document.createElement('div');
                attachmentElement.className = 'box';
                var canDelete = exports.shiftLog.userCanManageWorkOrders ||
                    attachment.recordCreate_userName === exports.shiftLog.userName;
                var fileIcon = getFileIcon(attachment.attachmentFileType);
                var isImage = attachment.attachmentFileType.startsWith('image/');
                // eslint-disable-next-line no-unsanitized/property
                attachmentElement.innerHTML = /* html */ "\n          <article class=\"media\">\n            <figure class=\"media-left\">\n              <p class=\"image is-48x48\">\n                ".concat(isImage
                    ? "<img src=\"".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/attachments/").concat(attachment.workOrderAttachmentId, "/inline\" alt=\"").concat(cityssm.escapeHTML(attachment.attachmentFileName), "\" style=\"object-fit: cover; width: 48px; height: 48px;\" />")
                    : "<span class=\"icon is-large has-text-grey\">\n                         <i class=\"fa-solid ".concat(fileIcon, " fa-2x\"></i>\n                       </span>"), "\n              </p>\n            </figure>\n            <div class=\"media-content\">\n              <div class=\"content\">\n                <p>\n                  <strong>\n                    <a href=\"").concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/attachments/").concat(attachment.workOrderAttachmentId, "/download\" target=\"_blank\">\n                      ").concat(cityssm.escapeHTML(attachment.attachmentFileName), "\n                    </a>\n                  </strong>\n                  <br />\n                  <small class=\"has-text-grey\">\n                    ").concat(formatFileSize(attachment.attachmentFileSizeInBytes), "\n                    &bull;\n                    ").concat(cityssm.escapeHTML(attachment.recordCreate_userName), "\n                    &bull;\n                    ").concat(cityssm.dateToString(new Date(attachment.recordCreate_dateTime)), "\n                  </small>\n                  ").concat(attachment.attachmentDescription
                    ? "<br /><span class=\"is-size-7\">".concat(cityssm.escapeHTML(attachment.attachmentDescription), "</span>")
                    : '', "\n                </p>\n              </div>\n              ").concat(canDelete
                    ? /* html */ "\n                    <nav class=\"level is-mobile\">\n                      <div class=\"level-left\">\n                        <a class=\"level-item download-attachment\" href=\"".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/attachments/").concat(attachment.workOrderAttachmentId, "/download\" target=\"_blank\">\n                          <span class=\"icon is-small\"><i class=\"fa-solid fa-download\"></i></span>\n                        </a>\n                        <a class=\"level-item delete-attachment\" data-attachment-id=\"").concat(attachment.workOrderAttachmentId, "\">\n                          <span class=\"icon is-small has-text-danger\"><i class=\"fa-solid fa-trash\"></i></span>\n                        </a>\n                      </div>\n                    </nav>\n                  ")
                    : /* html */ "\n                    <nav class=\"level is-mobile\">\n                      <div class=\"level-left\">\n                        <a class=\"level-item download-attachment\" href=\"".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/attachments/").concat(attachment.workOrderAttachmentId, "/download\" target=\"_blank\">\n                          <span class=\"icon is-small\"><i class=\"fa-solid fa-download\"></i></span>\n                        </a>\n                      </div>\n                    </nav>\n                  "), "\n            </div>\n          </article>\n        ");
                // Add event listeners
                if (canDelete) {
                    var deleteLink = attachmentElement.querySelector('.delete-attachment');
                    deleteLink.addEventListener('click', function (event) {
                        event.preventDefault();
                        deleteAttachment(attachment.workOrderAttachmentId);
                    });
                }
                attachmentsContainerElement.append(attachmentElement);
            };
            for (var _i = 0, attachments_1 = attachments; _i < attachments_1.length; _i++) {
                var attachment = attachments_1[_i];
                _loop_1(attachment);
            }
        }
        function showAddAttachmentModal() {
            var closeModalFunction;
            function doAddAttachment(submitEvent) {
                var _this = this;
                submitEvent.preventDefault();
                var formElement = submitEvent.currentTarget;
                var fileInput = formElement.querySelector('#addWorkOrderAttachment--attachmentFile');
                if (!fileInput.files || fileInput.files.length === 0) {
                    bulmaJS.alert({
                        contextualColorName: 'warning',
                        message: 'Please select a file to upload.'
                    });
                    return;
                }
                var file = fileInput.files[0];
                if (file.size > exports.attachmentMaximumFileSizeBytes) {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: "File size exceeds the maximum allowed size of ".concat(formatFileSize(exports.attachmentMaximumFileSizeBytes), ".")
                    });
                    return;
                }
                var submitButton = document.querySelector('#button--submitAttachment');
                submitButton.disabled = true;
                submitButton.classList.add('is-loading');
                var formData = new FormData(formElement);
                globalThis
                    .fetch("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doUploadWorkOrderAttachment"), {
                    method: 'POST',
                    body: formData
                })
                    .then(function (response) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, response.json()];
                }); }); })
                    .then(function (responseJSON) {
                    submitButton.disabled = false;
                    submitButton.classList.remove('is-loading');
                    if (responseJSON.success) {
                        closeModalFunction();
                        loadAttachments();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: responseJSON.message || 'Failed to upload attachment.'
                        });
                    }
                })
                    .catch(function () {
                    submitButton.disabled = false;
                    submitButton.classList.remove('is-loading');
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to upload attachment.'
                    });
                });
            }
            cityssm.openHtmlModal('workOrders-addAttachment', {
                onshow: function (modalElement) {
                    ;
                    modalElement.querySelector('#addWorkOrderAttachment--workOrderId').value = workOrderId;
                    // Display max file size
                    var maxSizeElement = modalElement.querySelector('#addWorkOrderAttachment--maxSize');
                    maxSizeElement.textContent = "Maximum file size: ".concat(formatFileSize(exports.attachmentMaximumFileSizeBytes));
                    // Handle file selection display
                    var fileInput = modalElement.querySelector('#addWorkOrderAttachment--attachmentFile');
                    var fileNameSpan = modalElement.querySelector('#addWorkOrderAttachment--fileName');
                    fileInput.addEventListener('change', function () {
                        if (fileInput.files && fileInput.files.length > 0) {
                            fileNameSpan.textContent = fileInput.files[0].name;
                        }
                        else {
                            fileNameSpan.textContent = 'No file selected';
                        }
                    });
                },
                onshown: function (modalElement, _closeModalFunction) {
                    var _a;
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    (_a = modalElement
                        .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddAttachment);
                },
                onremoved: function () {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteAttachment(workOrderAttachmentId) {
            bulmaJS.confirm({
                contextualColorName: 'danger',
                title: 'Delete Attachment',
                message: 'Are you sure you want to delete this attachment?',
                okButton: {
                    text: 'Delete',
                    callbackFunction: function () {
                        cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/doDeleteWorkOrderAttachment"), {
                            workOrderAttachmentId: workOrderAttachmentId
                        }, function (responseJSON) {
                            if (responseJSON.success) {
                                loadAttachments();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: 'Failed to delete attachment.'
                                });
                            }
                        });
                    }
                }
            });
        }
        function loadAttachments() {
            cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/").concat(workOrderId, "/doGetWorkOrderAttachments"), {}, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderAttachments(responseJSON.attachments);
                }
            });
        }
        // Add attachment button
        var addAttachmentButton = document.querySelector('#button--addAttachment');
        if (addAttachmentButton !== null) {
            addAttachmentButton.addEventListener('click', function () {
                showAddAttachmentModal();
            });
        }
        // Load attachments initially
        loadAttachments();
    }
})();
