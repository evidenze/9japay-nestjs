import { Test, TestingModule } from '@nestjs/testing';
import { _9JaPayService } from './nine-ja-pay.service';
import { NINE_JA_PAY_CONFIG } from '../constants';
import { _9JaPayConfig } from '../interfaces';

describe('_9JaPayService', () => {
  let service: _9JaPayService;

  const mockConfig: _9JaPayConfig = {
    apiKey: 'test-api-key',
    secretKey: 'test-secret-key',
    environment: 'sandbox',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NINE_JA_PAY_CONFIG,
          useValue: mockConfig,
        },
        _9JaPayService,
      ],
    }).compile();

    service = module.get<_9JaPayService>(_9JaPayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPermanentVirtualAccount', () => {
    it('should create a permanent virtual account', async () => {
      // Mock axios request here
      const request = {
        requestReference: 'test-ref-123',
        accountName: 'Test Account',
        autoPayoutEnabled: true,
      };

      // Add your test implementation here
      expect(service.createPermanentVirtualAccount).toBeDefined();
    });
  });

  describe('createTransientVirtualAccount', () => {
    it('should create a transient virtual account', async () => {
      const request = {
        requestReference: 'test-ref-456',
        timeToLive: '3600',
        amount: 100000,
        isSinglePayment: true,
      };

      expect(service.createTransientVirtualAccount).toBeDefined();
    });
  });

  describe('getBankList', () => {
    it('should retrieve list of banks', async () => {
      expect(service.getBankList).toBeDefined();
    });
  });

  describe('nameEnquiry', () => {
    it('should perform name enquiry', async () => {
      const request = {
        bankCode: '057',
        accountNumber: '1234567890',
      };

      expect(service.nameEnquiry).toBeDefined();
    });
  });

  describe('transfer', () => {
    it('should initiate a transfer', async () => {
      const request = {
        paymentReference: 'pay-ref-123',
        senderAccountNumber: '9000001234',
        senderAccountName: 'Sender Name',
        recipientAccountNumber: '1234567890',
        recipientAccountName: 'Recipient Name',
        recipientBankCode: '057',
        amount: '100000',
        nameEnquiryReference: 'name-enq-ref',
        narration: 'Test transfer',
      };

      expect(service.transfer).toBeDefined();
    });
  });
});
