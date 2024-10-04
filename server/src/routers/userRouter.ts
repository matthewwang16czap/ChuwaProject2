import express from 'express';
import { login, changePassword } from '../controllers/userController'; 

const router = express.Router();

router.post('/login', login);
router.post('/changepassword', changePassword);

export default router;