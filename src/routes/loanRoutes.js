import express from 'express';
import { LoanController } from '../controllers/loanController.js';

const router = express.Router();

// ROUTE BARU (Harus diletakkan sebelum route lain yang berpotensi konflik)
router.get('/top-borrowers', LoanController.getTopBorrowers);

router.get('/', LoanController.getLoans);
router.post('/', LoanController.createLoan);

export default router;