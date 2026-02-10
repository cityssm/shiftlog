import { getNoteTypeTemplates } from '../../helpers/noteTypeTemplates.helpers.js';
export default function handler(_request, response) {
    const templates = getNoteTypeTemplates();
    response.json({
        templates
    });
}
