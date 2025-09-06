// Base response interface
export interface _9JaPayResponse<T = any> {
  status: 'SUCCESS' | 'PROCESSING' | 'FAILED';
  message: string;
  statusCode: string;
  data?: T;
}

// Pagination interfaces
export interface PaginationQuery {
  pageSize: number;
  pageNumber: number;
}

export interface PaginatedResponse<T> extends _9JaPayResponse<T[]> {
  totalCount: number;
}

// Virtual Account interfaces
export interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  businessId: string;
  status: 'Active' | 'Closed';
  accountBalance?: number;
  accountType?: 'Permanent' | 'Transient';
  autoPayoutEnabled?: boolean;
  requestReference?: string;
  amount?: number | null;
  isSinglePayment?: boolean;
  expiresAt?: string;
}

export interface CreatePermanentVirtualAccountRequest {
  requestReference: string;
  accountName: string;
  autoPayoutEnabled: boolean;
}

export interface CreatePermanentVirtualAccountResponse {
  requestReference: string;
  id: string;
  accountNumber: string;
}

export interface UpdatePermanentVirtualAccountRequest {
  accountName?: string;
  blockStatus?: boolean;
  autoPayoutEnabled?: boolean;
}

export interface CreateTransientVirtualAccountRequest {
  requestReference: string;
  timeToLive: string;
  amount?: number;
  isSinglePayment?: boolean;
}

export interface CreateTransientVirtualAccountResponse {
  requestReference: string;
  id: string;
  accountNumber: string;
}

export interface UpdateTransientVirtualAccountRequest {
  blockStatus?: boolean;
}

export interface ClosePermanentVirtualAccountRequest {
  requestReference: string;
  accountNumber: string;
  reasonForClosure: string;
}

// Balance interfaces
export interface AccountBalance {
  accountBalance: number;
}

export interface TotalBalanceSummary {
  totalPermanentAccountBalance: number;
  totalTransientAccountBalance: number;
  totalVirtualAccountBalance: number;
}

export interface AllVirtualAccountsResponse extends PaginatedResponse<VirtualAccount> {
  totalPermanentAccountCount: number;
  totalTransientAccountCount: number;
}

// Bank and Transfer interfaces
export interface Bank {
  name: string;
  code: string;
}

export interface NameEnquiryRequest {
  bankCode: string;
  accountNumber: string;
}

export interface NameEnquiryResponse {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  nameEnquiryReference: string;
}

export interface TransferRequest {
  paymentReference: string;
  senderAccountNumber: string;
  senderAccountName: string;
  recipientAccountNumber: string;
  recipientAccountName: string;
  recipientBankCode: string;
  amount: string;
  nameEnquiryReference: string;
  narration: string;
}

export interface TransferResponse {
  id: string;
}

export interface TransactionStatusQueryResponse {
  id: string;
  paymentReference: string;
  sessionId?: string;
  amount: number;
  status: 'Success' | 'Failed' | 'Processing';
  transferDate: string;
}

// Transaction interfaces
export interface TransactionMetadata {
  senderAccountName: string;
  senderAccountNumber: string;
  senderBank: string;
  senderBankCode: string;
  recipients: Array<{
    accountName: string;
    bank: string;
  }>;
}

export interface Transaction {
  transactionId: string;
  transactionReference: string;
  accountNumber: string;
  transactionType: 'Credit' | 'Debit';
  amount: number;
  narration: string;
  transactionDate: string;
  notificationStatus: 'Success' | 'Pending' | 'Failed';
  metadata: TransactionMetadata;
}

export interface GetTransactionsQuery extends PaginationQuery {
  accountNumber?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResendNotificationRequest {
  transactionId: string;
}

export interface ResendNotificationsForAccountRequest {
  accountNumber: string;
}

export interface ResendNotificationsResponse {
  numberOfResentNotifications: number;
}

export interface SimulateDepositRequest {
  recipientAccountNumber: string;
  amount: string;
  authKey: string;
}

// Environment configuration
export type Environment = 'sandbox' | 'production';

export interface _9JaPayConfig {
  apiKey: string;
  secretKey: string;
  environment: Environment;
  baseUrl?: string;
  rejectUnauthorized?: boolean; // For local testing - set to false to ignore SSL cert errors
}

// Error interfaces
export interface _9JaPayError extends Error {
  nineJaPayStatusCode?: string; // 9jaPay's status code (e.g., "26", "01", etc.)
  httpStatusCode?: number; // HTTP status code (e.g., 400, 500, etc.)
  response?: _9JaPayResponse;
}
