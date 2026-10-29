import { Router } from 'express';
import { getOverview, getIncidents, syncData } from '../controllers/overviewController.js';

const router = Router();

router.get('/summary', getOverview);
router.get('/incidents', getIncidents);
router.post('/sync', syncData);

export default router;
