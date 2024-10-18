import express from 'express';
import { login, changePassword, getAllEmployeeUsers } from '../controllers/userController'; 
import {verifyToken, verifyHR} from "../middlewares/tokenAuth"

const router = express.Router();

router.post('/login', login);
router.post('/changepassword', verifyToken, changePassword);
router.get('/allemployees', verifyToken, verifyHR, getAllEmployeeUsers);


export default router;