
import { processDepositBalance, createTransactionRecord } from './core/depositProcessor';
import { updateUserBalance } from './core/balanceOperations';
import { processAllPendingDeposits } from './core/pendingDeposits';

// Re-export all utility functions
export {
  processDepositBalance,
  createTransactionRecord,
  updateUserBalance,
  processAllPendingDeposits
};
