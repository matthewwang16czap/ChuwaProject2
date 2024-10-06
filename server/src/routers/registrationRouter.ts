import express from 'express';
import { sendInvitation, register } from '../controllers/registrationController'; 
import { verifyToken, verifyHR } from "../middlewares/tokenAuth"

const router = express.Router();

router.post('/sendinvitation', verifyToken, verifyHR, sendInvitation);
router.post('/register', register);

export default router;