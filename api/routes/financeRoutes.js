const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', financeController.getTransactions);
router.get('/summary', financeController.getFinanceSummary);
router.post('/', financeController.createTransaction);
router.put('/:id', financeController.updateTransaction);
router.delete('/:id', financeController.deleteTransaction);

module.exports = router;
