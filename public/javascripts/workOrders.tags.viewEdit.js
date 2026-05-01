(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    const tagsContainerElement = document.querySelector('#container--tags');
    if (tagsContainerElement !== null) {
        function renderTags(tags) {
            if (tags.length === 0) {
                ;
                tagsContainerElement.innerHTML = `
          <p class="has-text-grey">No tags have been added.</p>
        `;
                return;
            }
            ;
            tagsContainerElement.innerHTML = '';
            const tagsElement = document.createElement('div');
            tagsElement.className = 'tags';
            for (const tag of tags) {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag is-medium';
                if (tag.tagBackgroundColor && tag.tagTextColor) {
                    tagElement.style.backgroundColor = `#${tag.tagBackgroundColor}`;
                    tagElement.style.color = `#${tag.tagTextColor}`;
                }
                const tagTextElement = document.createElement('span');
                tagTextElement.textContent = tag.tagName;
                tagElement.append(tagTextElement);
                if (exports.isEdit) {
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'delete is-small';
                    deleteButton.type = 'button';
                    deleteButton.dataset.tagName = tag.tagName;
                    deleteButton.title = `Remove tag ${tag.tagName}`;
                    deleteButton.addEventListener('click', () => {
                        deleteTag(tag.tagName);
                    });
                    tagElement.append(deleteButton);
                }
                tagsElement.append(tagElement);
            }
            tagsContainerElement?.append(tagsElement);
        }
        function deleteTag(tagName) {
            bulmaJS.confirm({
                contextualColorName: 'warning',
                title: 'Remove Tag',
                message: `Are you sure you want to remove the tag "${tagName}" from this work order?`,
                okButton: {
                    contextualColorName: 'warning',
                    text: 'Remove Tag',
                    callbackFunction() {
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderTag`, {
                            tagName,
                            workOrderId: Number.parseInt(workOrderId, 10)
                        }, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
                            if (responseJSON.success) {
                                renderTags(responseJSON.tags);
                                bulmaJS.alert({
                                    contextualColorName: 'success',
                                    title: 'Tag Removed',
                                    message: 'Tag has been successfully removed from this work order.'
                                });
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    title: 'Error Removing Tag',
                                    message: responseJSON.errorMessage
                                });
                            }
                        });
                    }
                }
            });
        }
        function addTag() {
            let closeModalFunction;
            function renderSuggestedTags(containerElement, suggestedTags, getCloseFunction) {
                if (suggestedTags.length === 0) {
                    containerElement.innerHTML = '';
                    return;
                }
                containerElement.innerHTML = `
          <div class="field">
            <label class="label">Suggested Tags</label>
            <div class="control">
              <div class="tags" id="tags--suggested"></div>
            </div>
            <p class="help">Recently used tags that are not yet on this work order. Click to add.</p>
          </div>
        `;
                const tagsElement = containerElement.querySelector('#tags--suggested');
                for (const suggestedTag of suggestedTags) {
                    const tagElement = document.createElement('button');
                    tagElement.className = 'tag is-medium is-clickable';
                    tagElement.type = 'button';
                    if ((suggestedTag.tagBackgroundColor?.length ?? 0) > 0 &&
                        (suggestedTag.tagTextColor?.length ?? 0) > 0) {
                        tagElement.style.backgroundColor = `#${suggestedTag.tagBackgroundColor}`;
                        tagElement.style.color = `#${suggestedTag.tagTextColor}`;
                    }
                    tagElement.textContent = suggestedTag.tagName;
                    const addSuggestedTag = () => {
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderTag`, {
                            tagName: suggestedTag.tagName,
                            workOrderId: Number.parseInt(workOrderId, 10)
                        }, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
                            if (responseJSON.success) {
                                getCloseFunction()();
                                renderTags(responseJSON.tags);
                                bulmaJS.alert({
                                    contextualColorName: 'success',
                                    message: 'Tag has been successfully added to this work order.',
                                    okButton: {
                                        callbackFunction() {
                                            addTag();
                                        }
                                    },
                                    title: 'Tag Added'
                                });
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: responseJSON.errorMessage,
                                    title: 'Error Adding Tag'
                                });
                            }
                        });
                    };
                    tagElement.addEventListener('click', addSuggestedTag);
                    tagsElement.append(tagElement);
                }
            }
            function doAddTag(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                const tagNameInput = formElement.querySelector('#addWorkOrderTag--tagName');
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderTag`, {
                    tagName: tagNameInput.value,
                    workOrderId: Number.parseInt(workOrderId, 10)
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        closeModalFunction();
                        renderTags(responseJSON.tags);
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Tag has been successfully added to this work order.',
                            title: 'Tag Added',
                            okButton: {
                                callbackFunction() {
                                    addTag();
                                }
                            }
                        });
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: responseJSON.errorMessage,
                            title: 'Error Adding Tag'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-addTag', {
                onshow(modalElement) {
                    exports.shiftLog.setUnsavedChanges('modal');
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doAddTag);
                    const suggestedTagsContainer = modalElement.querySelector('#container--suggestedTags');
                    if (suggestedTagsContainer !== null) {
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetSuggestedTags`, {}, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
                            renderSuggestedTags(suggestedTagsContainer, responseJSON.suggestedTags, () => closeModalFunction);
                        });
                    }
                },
                onshown(modalElement, closeFunction) {
                    closeModalFunction = closeFunction;
                    bulmaJS.toggleHtmlClipped();
                    modalElement.querySelector('#addWorkOrderTag--tagName').focus();
                },
                onremoved() {
                    exports.shiftLog.clearUnsavedChanges('modal');
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        document.querySelector('#button--addTag')?.addEventListener('click', addTag);
        renderTags(exports.workOrderTags);
    }
})();
