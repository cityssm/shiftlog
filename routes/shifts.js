import { Router } from 'express';
import handler_new from '../handlers/shifts-get/new.js';
import handler_search from '../handlers/shifts-get/search.js';
function updateHandler(request, response, next) {
    if (request.session.user?.userProperties.shifts.canUpdate ?? false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
export const router = Router();
router.get('/', handler_search);
router.get('/new', updateHandler, handler_new);
export default router;
