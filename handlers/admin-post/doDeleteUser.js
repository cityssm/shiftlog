import deleteUser from '../../database/users/deleteUser.js';
import getUsers from '../../database/users/getUsers.js';
export default async function handler(request, response) {
    let userName = request.body.userName ?? '';
    if (typeof userName === 'string') {
        userName = userName.trim();
    }
    if (typeof userName !== 'string' || userName === '') {
        response.status(400).json({
            message: 'User name is required',
            success: false
        });
        return;
    }
    const success = await deleteUser(userName, request.session.user);
    if (success) {
        const users = await getUsers();
        response.json({
            message: 'User deleted successfully',
            success: true,
            users
        });
    }
    else {
        response.status(404).json({
            message: 'User not found',
            success: false
        });
    }
}
