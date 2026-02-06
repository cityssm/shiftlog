import updateNoteTypeField from '../../database/noteTypes/updateNoteTypeField.js';
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
export default async function handler(request, response) {
    const noteTypeFieldId = Number.parseInt(request.body.noteTypeFieldId, 10);
    const fieldLabel = request.body.fieldLabel ?? '';
    const fieldInputType = request.body.fieldInputType ?? 'text';
    const fieldHelpText = request.body.fieldHelpText ?? '';
    const dataListKey = request.body.dataListKey === '' || request.body.dataListKey === undefined
        ? null
        : request.body.dataListKey;
    const fieldValueMin = request.body.fieldValueMin === '' ||
        request.body.fieldValueMin === undefined
        ? null
        : Number.parseInt(request.body.fieldValueMin, 10);
    const fieldValueMax = request.body.fieldValueMax === '' ||
        request.body.fieldValueMax === undefined
        ? null
        : Number.parseInt(request.body.fieldValueMax, 10);
    const fieldValueRequired = request.body.fieldValueRequired === true ||
        request.body.fieldValueRequired === '1';
    const hasDividerAbove = request.body.hasDividerAbove === true ||
        request.body.hasDividerAbove === '1';
    const success = await updateNoteTypeField({
        noteTypeFieldId,
        fieldLabel,
        fieldInputType,
        fieldHelpText,
        dataListKey,
        fieldValueMin,
        fieldValueMax,
        fieldValueRequired,
        hasDividerAbove
    }, request.session.user);
    if (success) {
        const noteTypes = await getNoteTypes();
        response.json({
            success: true,
            noteTypes
        });
    }
    else {
        response.json({
            success: false,
            message: 'Field could not be updated.'
        });
    }
}
