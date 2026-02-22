import express from 'express';
import { verifyToken } from '../middlewares/authentication.js';
import { 
  getUserHealthContext, 
  saveChatbotConversation, 
  getMedicalSummary,
  updateOnboardingStatus,
  checkOnboardingStatus
} from '../controllers/healthContextController.js';

const router = express.Router();

router.get('/context', verifyToken, getUserHealthContext);
router.post('/conversation', verifyToken, saveChatbotConversation);
router.get('/summary', verifyToken, getMedicalSummary);
router.put('/onboarding', verifyToken, updateOnboardingStatus);
router.get('/onboarding', verifyToken, checkOnboardingStatus);

export default router;
