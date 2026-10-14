export type ComparedToPrevious = {
    spentChange: number;
    transactionChange: number;
};

export type SpendingSummaryData = {
    totalSpent: number;
    transactionsCount: number;
    averageTransaction: number;
    topCategory: string;
    comparedToPrevious: ComparedToPrevious;
};
