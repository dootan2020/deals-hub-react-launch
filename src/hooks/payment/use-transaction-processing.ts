
import { processDepositBalance, createTransactionRecord } from '@/utils/payment/core/depositProcessor';
import { updateUserBalance } from '@/utils/payment/core/balanceOperations';

export const useTransactionProcessing = () => {
  return {
    processDepositBalance,
    createTransactionRecord,
    updateUserBalance
  };
};
