import { Injectable, Inject } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as https from 'https';
import type { _9JaPayConfig } from '../interfaces';
import {
  Environment,
  _9JaPayResponse,
  _9JaPayError,
  CreatePermanentVirtualAccountRequest,
  CreatePermanentVirtualAccountResponse,
  UpdatePermanentVirtualAccountRequest,
  VirtualAccount,
  PaginationQuery,
  AllVirtualAccountsResponse,
  ClosePermanentVirtualAccountRequest,
  CreateTransientVirtualAccountRequest,
  CreateTransientVirtualAccountResponse,
  UpdateTransientVirtualAccountRequest,
  AccountBalance,
  TotalBalanceSummary,
  Bank,
  NameEnquiryRequest,
  NameEnquiryResponse,
  TransferRequest,
  TransferResponse,
  TransactionStatusQueryResponse,
  Transaction,
  GetTransactionsQuery,
  PaginatedResponse,
  ResendNotificationRequest,
  ResendNotificationsForAccountRequest,
  ResendNotificationsResponse,
  SimulateDepositRequest,
} from '../interfaces';
import { NINE_JA_PAY_CONFIG } from '../constants';

@Injectable()
export class _9JaPayService {
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor(@Inject(NINE_JA_PAY_CONFIG) private readonly config: _9JaPayConfig) {
    this.baseUrl = this.config.baseUrl || this.getDefaultBaseUrl(this.config.environment);
    
    // Create HTTPS agent - configure SSL verification based on config
    const httpsAgent = new https.Agent({
      rejectUnauthorized: this.config.rejectUnauthorized !== false, // Default to true for security
    });
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey,
        'secret': this.config.secretKey,
      },
      httpsAgent: httpsAgent,
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        const responseData = error.response?.data as any;
        const nineJaPayError: _9JaPayError = new Error(
          responseData?.message || error.message
        );
        nineJaPayError.statusCode = responseData?.statusCode;
        nineJaPayError.response = responseData;
        throw nineJaPayError;
      }
    );
  }

  private getDefaultBaseUrl(environment: Environment): string {
    return environment === 'production'
      ? 'https://developer.9japay.com/v1/api'
      : 'https://test.developer.9japay.com/v1/api';
  }

  // Permanent Virtual Accounts
  async createPermanentVirtualAccount(
    request: CreatePermanentVirtualAccountRequest
  ): Promise<_9JaPayResponse<CreatePermanentVirtualAccountResponse>> {
    const response = await this.httpClient.post('/virtual-accounts/permanent', request);
    return response.data;
  }

  async updatePermanentVirtualAccount(
    accountNumber: string,
    request: UpdatePermanentVirtualAccountRequest
  ): Promise<_9JaPayResponse<VirtualAccount>> {
    const response = await this.httpClient.patch(`/virtual-accounts/permanent/${accountNumber}`, request);
    return response.data;
  }

  async getPermanentVirtualAccount(accountNumber: string): Promise<_9JaPayResponse<VirtualAccount>> {
    const response = await this.httpClient.get(`/virtual-accounts/permanent/${accountNumber}`);
    return response.data;
  }

  async getAllPermanentVirtualAccounts(
    query: PaginationQuery
  ): Promise<PaginatedResponse<VirtualAccount>> {
    const response = await this.httpClient.get('/virtual-accounts/permanent', {
      params: {
        'page-size': query.pageSize,
        'page-number': query.pageNumber,
      },
    });
    return response.data;
  }

  async closePermanentVirtualAccount(
    request: ClosePermanentVirtualAccountRequest
  ): Promise<_9JaPayResponse> {
    const response = await this.httpClient.delete('/virtual-accounts/permanent', { data: request });
    return response.data;
  }

  // Transient Virtual Accounts
  async createTransientVirtualAccount(
    request: CreateTransientVirtualAccountRequest
  ): Promise<_9JaPayResponse<CreateTransientVirtualAccountResponse>> {
    const response = await this.httpClient.post('/virtual-accounts/transient', request);
    return response.data;
  }

  async updateTransientVirtualAccount(
    accountNumber: string,
    request: UpdateTransientVirtualAccountRequest
  ): Promise<_9JaPayResponse<VirtualAccount>> {
    const response = await this.httpClient.put(`/virtual-accounts/transient/${accountNumber}`, request);
    return response.data;
  }

  async getTransientVirtualAccount(accountNumber: string): Promise<_9JaPayResponse<VirtualAccount>> {
    const response = await this.httpClient.get(`/virtual-accounts/transient/${accountNumber}`);
    return response.data;
  }

  async getAllTransientVirtualAccounts(
    query: PaginationQuery
  ): Promise<PaginatedResponse<VirtualAccount>> {
    const response = await this.httpClient.get('/virtual-accounts/transient', {
      params: {
        'page-size': query.pageSize,
        'page-number': query.pageNumber,
      },
    });
    return response.data;
  }

  // All Virtual Accounts
  async getAllVirtualAccounts(query: PaginationQuery): Promise<AllVirtualAccountsResponse> {
    const response = await this.httpClient.get('/virtual-accounts', {
      params: {
        'page-size': query.pageSize,
        'page-number': query.pageNumber,
      },
    });
    return response.data;
  }

  async getVirtualAccount(accountNumber: string): Promise<_9JaPayResponse<VirtualAccount>> {
    const response = await this.httpClient.get(`/virtual-accounts/${accountNumber}`);
    return response.data;
  }

  // Balance Operations
  async getTotalBalanceSummary(): Promise<_9JaPayResponse<TotalBalanceSummary>> {
    const response = await this.httpClient.get('/virtual-accounts/total-balance');
    return response.data;
  }

  async getAccountBalance(accountNumber: string): Promise<_9JaPayResponse<AccountBalance>> {
    const response = await this.httpClient.get(`/virtual-accounts/balance/${accountNumber}`);
    return response.data;
  }

  // Transfers
  async getBankList(): Promise<_9JaPayResponse<Bank[]>> {
    const response = await this.httpClient.get('/banks');
    return response.data;
  }

  async nameEnquiry(request: NameEnquiryRequest): Promise<_9JaPayResponse<NameEnquiryResponse>> {
    const response = await this.httpClient.post('/transfers/name-enquiry', request);
    return response.data;
  }

  async transfer(request: TransferRequest): Promise<_9JaPayResponse<TransferResponse>> {
    const response = await this.httpClient.post('/transfers', request);
    return response.data;
  }

  async transferFromVirtualAccount(request: TransferRequest): Promise<_9JaPayResponse<TransferResponse>> {
    const response = await this.httpClient.post('/transfers/virtual-account', request);
    return response.data;
  }

  async getTransactionStatus(reference: string): Promise<_9JaPayResponse<TransactionStatusQueryResponse>> {
    const response = await this.httpClient.get(`/transfers/tsq/${reference}`);
    return response.data;
  }

  // Transactions
  async getTransactions(query: GetTransactionsQuery): Promise<PaginatedResponse<Transaction>> {
    const params: any = {
      'page-size': query.pageSize,
      'page-number': query.pageNumber,
    };

    if (query.accountNumber) params['account-number'] = query.accountNumber;
    if (query.startDate) params['start-date'] = query.startDate;
    if (query.endDate) params['end-date'] = query.endDate;

    const response = await this.httpClient.get('/transactions', { params });
    return response.data;
  }

  async getTransactionById(transactionId: string): Promise<_9JaPayResponse<Transaction>> {
    const response = await this.httpClient.get(`/transactions/${transactionId}`);
    return response.data;
  }

  async resendNotification(request: ResendNotificationRequest): Promise<_9JaPayResponse> {
    const response = await this.httpClient.post('/transactions/resend-notification', request);
    return response.data;
  }

  async resendNotificationsForAccount(
    request: ResendNotificationsForAccountRequest
  ): Promise<_9JaPayResponse<ResendNotificationsResponse>> {
    const response = await this.httpClient.post('/transactions/resend-notifications-for-account', request);
    return response.data;
  }

  async resendAllNotifications(): Promise<_9JaPayResponse<ResendNotificationsResponse>> {
    const response = await this.httpClient.post('/transactions/resend-all-notifications');
    return response.data;
  }

  async simulateDeposit(request: SimulateDepositRequest): Promise<_9JaPayResponse> {
    if (this.config.environment !== 'sandbox') {
      throw new Error('Simulate deposit is only available in sandbox environment');
    }
    const response = await this.httpClient.post('/transactions/simulate-deposit', request);
    return response.data;
  }
}
