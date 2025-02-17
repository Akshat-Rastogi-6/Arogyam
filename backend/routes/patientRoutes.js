import express from 'express';
import { getGoogleFit, getPatientDetails, getUserInfoDetails, updatePatientDetails } from '../controllers/patientController.js';
import { verifyToken } from "../middlewares/authentication.js";

const router = express.Router();

router.get('/profile', verifyToken, getPatientDetails);

router.put('/info', verifyToken, updatePatientDetails);

router.get('/googlefit', verifyToken, getGoogleFit);

router.get('/info', verifyToken, getUserInfoDetails)

export default router;
