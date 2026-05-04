import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/users', protect, requireAdmin, userController.listUsers);
router.get('/profile', protect, userController.getProfile);
router.put('/profile/:id', protect, userController.updateProfile);
router.post('/block/:id', protect, requireAdmin, userController.blockUser);
router.post('/unblock/:id', protect, requireAdmin, userController.unblockUser);
router.post('/change-password/:id', protect, userController.changePassword);
router.get('/userdetails/:id', protect, requireAdmin, userController.getUserById);
export default router;