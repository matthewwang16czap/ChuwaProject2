import express from 'express';
import { sendInvitation, register } from '../controllers/registrationController'; 

const router = express.Router();

router.post('/sendinvitation', sendInvitation);
router.post('/register', register);

export default router;