import addUser from '../../database/users/addUser.js';
import getUsers from '../../database/users/getUsers.js';
export default async function handler(request, response) {
    const success = await addUser(request.body.userName, request.session.user);
    const users = await getUsers();
    response.json({
        success,
        users
    });
}
