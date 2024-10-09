import express from 'express';
import { login, changePassword } from '../controllers/userController'; 
import {verifyToken} from "../middlewares/tokenAuth"

const router = express.Router();

router.post('/login', login);
router.post('/changepassword', verifyToken, changePassword);

export default router;