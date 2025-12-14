import { Router } from 'express';
import {
    contactUs,
    userStats,
} from '../controllers/miscellaneous.controller.js';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const miscellaneousRouter = Router();

// {{URL}}/api/v1/
miscellaneousRouter.route('/contact').post(contactUs);
miscellaneousRouter
    .route('/admin/stats/users')
    .get(isLoggedIn, authorizedRoles('ADMIN'), userStats);

export default miscellaneousRouter;