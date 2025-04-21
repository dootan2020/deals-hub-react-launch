
export * from './calculateFees';
export * from './depositRecord';
export * from './balanceProcessing';
export * from './transactionProcessing';

// Re-export the function needed by DepositHistoryPage
export const processAllPendingDeposits = async () => {
  const { processPendingTransactions } = await import('./transactionProcessing');
  const result = await processPendingTransactions();
  return { 
    success: result.success, 
    count: result.processed, 
    error: result.error 
  };
};
