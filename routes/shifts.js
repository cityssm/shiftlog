import { Router } from 'express';
import searchHandler from '../handlers/shifts-get/search.js';
export const router = Router();
router.get('/', searchHandler);
export default router;
