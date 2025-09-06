# 9jaPay NestJS SDK - Setup Guide

This guide will walk you through setting up and using the 9jaPay NestJS SDK in your project.

## Installation

### 1. Install the Package

```bash
npm install 9japay-nestjs
# or
yarn add 9japay-nestjs
```

### 2. Install Peer Dependencies

Make sure you have the required NestJS packages:

```bash
npm install @nestjs/common @nestjs/core rxjs reflect-metadata
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
NINE_JA_PAY_API_KEY=your-api-key
NINE_JA_PAY_SECRET_KEY=your-secret-key
NINE_JA_PAY_ENVIRONMENT=sandbox
```

### Module Setup

#### Option 1: Simple Registration

```typescript
import { Module } from '@nestjs/common';
import { NineJaPayModule } from '9japay-nestjs';

@Module({
  imports: [
    NineJaPayModule.register({
      apiKey: 'your-api-key',
      secretKey: 'your-secret-key',
      environment: 'sandbox', // or 'production'
    }),
  ],
})
export class AppModule {}
```

#### Option 2: Async Registration with ConfigService

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NineJaPayModule } from '9japay-nestjs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NineJaPayModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('NINE_JA_PAY_API_KEY'),
        secretKey: configService.get('NINE_JA_PAY_SECRET_KEY'),
        environment: configService.get('NINE_JA_PAY_ENVIRONMENT'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Basic Usage

### 1. Inject the Service

```typescript
import { Injectable } from '@nestjs/common';
import { NineJaPayService } from '9japay-nestjs';

@Injectable()
export class MyService {
  constructor(private readonly nineJaPayService: NineJaPayService) {}

  async createAccount() {
    const result = await this.nineJaPayService.createPermanentVirtualAccount({
      requestReference: `ref-${Date.now()}`,
      accountName: 'John Doe',
      autoPayoutEnabled: true,
    });

    return result;
  }
}
```

### 2. Error Handling

```typescript
try {
  const result = await this.nineJaPayService.createPermanentVirtualAccount({
    requestReference: 'unique-ref',
    accountName: 'Test Account',
    autoPayoutEnabled: true,
  });

  if (result.status === 'SUCCESS') {
    console.log('Account created:', result.data);
  }
} catch (error) {
  console.error('Error:', error.message);
  console.error('Status Code:', error.statusCode);
}
```

## Common Use Cases

### 1. Creating Virtual Accounts

```typescript
// Permanent account
const permanentAccount = await nineJaPayService.createPermanentVirtualAccount({
  requestReference: 'unique-ref-123',
  accountName: 'Customer Account',
  autoPayoutEnabled: true,
});

// Temporary account for specific payment
const tempAccount = await nineJaPayService.createTransientVirtualAccount({
  requestReference: 'temp-ref-123',
  timeToLive: '3600', // 1 hour
  amount: 500000, // 5000 NGN in kobo
  isSinglePayment: true,
});
```

### 2. Making Transfers

```typescript
// Validate recipient account first
const validation = await nineJaPayService.nameEnquiry({
  bankCode: '057',
  accountNumber: '1234567890',
});

if (validation.status === 'SUCCESS') {
  // Proceed with transfer
  const transfer = await nineJaPayService.transfer({
    paymentReference: `pay-${Date.now()}`,
    senderAccountNumber: '9000001234',
    senderAccountName: 'Sender Name',
    recipientAccountNumber: '1234567890',
    recipientAccountName: validation.data.accountName,
    recipientBankCode: '057',
    amount: '100000', // 1000 NGN in kobo
    nameEnquiryReference: validation.data.nameEnquiryReference,
    narration: 'Payment for services',
  });
}
```

### 3. Checking Balances

```typescript
// Get total balance across all accounts
const totalBalance = await nineJaPayService.getTotalBalanceSummary();

// Get specific account balance
const accountBalance = await nineJaPayService.getAccountBalance('9000001234');
```

### 4. Transaction Management

```typescript
// Get transactions for a specific account
const transactions = await nineJaPayService.getTransactions({
  pageNumber: 1,
  pageSize: 20,
  accountNumber: '9000001234',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});

// Get specific transaction details
const transaction = await nineJaPayService.getTransactionById('transaction-id');

// Resend failed webhook notifications
await nineJaPayService.resendNotification({
  transactionId: 'transaction-id',
});
```

## Testing

### Unit Testing

```typescript
import { Test } from '@nestjs/testing';
import { NineJaPayService } from '9japay-nestjs';
import { NINE_JA_PAY_CONFIG } from '9japay-nestjs';

describe('MyService', () => {
  let service: MyService;
  let nineJaPayService: NineJaPayService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: NINE_JA_PAY_CONFIG,
          useValue: {
            apiKey: 'test-key',
            secretKey: 'test-secret',
            environment: 'sandbox',
          },
        },
        NineJaPayService,
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    nineJaPayService = module.get<NineJaPayService>(NineJaPayService);
  });

  // Your tests here
});
```

### Integration Testing (Sandbox)

```typescript
// Use sandbox environment for testing
const testConfig = {
  apiKey: 'sandbox-api-key',
  secretKey: 'sandbox-secret-key',
  environment: 'sandbox' as const,
  rejectUnauthorized: false, // For local testing environments
};

// Test deposit simulation (sandbox only)
await nineJaPayService.simulateDeposit({
  recipientAccountNumber: '9000001234',
  amount: '100000',
  authKey: 'test-auth-key',
});
```

### Local Development SSL Issues

If you encounter SSL certificate errors during local development, you can disable SSL verification:

```typescript
NineJaPayModule.register({
  apiKey: 'your-api-key',
  secretKey: 'your-secret-key',
  environment: 'sandbox',
  rejectUnauthorized: false, // Only for local testing!
})
```

⚠️ **Important**: Never use `rejectUnauthorized: false` in production environments!

## Best Practices

### 1. Configuration Management

- Always use environment variables for sensitive data
- Use different configurations for different environments
- Never commit API keys to version control

### 2. Error Handling

- Always wrap API calls in try-catch blocks
- Check the `status` field in responses
- Log errors for debugging

### 3. Reference Generation

- Generate unique request references for each API call
- Use timestamps or UUIDs for uniqueness
- Store references for tracking and reconciliation

### 4. Webhook Handling

- Implement webhook endpoints to receive transaction notifications
- Always respond with HTTP 200 OK to acknowledge receipt
- Implement retry logic for failed webhook notifications

### 5. Testing

- Use sandbox environment for all testing
- Test error scenarios and edge cases
- Implement proper unit and integration tests

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API key and secret key are correct
   - Ensure you're using the right environment (sandbox/production)

2. **Validation Errors**
   - Check that all required fields are provided
   - Ensure data types match the API specification
   - Verify that request references are unique

3. **Network Issues**
   - Check internet connectivity
   - Verify firewall settings
   - Consider implementing retry logic

### Getting Help

- Check the [9jaPay API Documentation](https://developer.9japay.com)
- Review the SDK's GitHub repository for issues and examples
- Contact 9jaPay support for API-related questions

## Production Checklist

Before going live:

- [ ] Switch to production environment
- [ ] Use production API keys
- [ ] Implement proper error handling
- [ ] Set up monitoring and logging
- [ ] Test all critical flows
- [ ] Implement webhook endpoints
- [ ] Set up proper security measures
- [ ] Review and test backup procedures
