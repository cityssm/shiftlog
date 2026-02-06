import getDataLists from '../../database/app/getDataLists.js';
import getNoteTypes from '../../database/noteTypes/getNoteTypes.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(_request, response) {
    const noteTypes = await getNoteTypes();
    const userGroups = await getUserGroups();
    const dataLists = await getDataLists();
    response.render('admin/noteTypes', {
        headTitle: 'Note Type Maintenance',
        section: 'admin',
        dataLists,
        noteTypes,
        userGroups
    });
}
