# 9jaPay NestJS SDK

A comprehensive NestJS SDK for integrating with 9jaPay Virtual Account APIs. This SDK provides a type-safe, easy-to-use interface for all 9jaPay API endpoints including virtual account management, transfers, and transaction handling.

## Features

- 🚀 **Full API Coverage**: Complete implementation of all 9jaPay API endpoints
- 🛡️ **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🏗️ **NestJS Integration**: Native NestJS module with dependency injection support
- 🌍 **Multi-Environment**: Support for both sandbox and production environments
- 📚 **Well Documented**: Comprehensive documentation and examples
- ✅ **Tested**: Unit tests included
- 🔧 **Configurable**: Flexible configuration options

## Installation

```bash
npm install 9japay-nestjs
# or
yarn add 9japay-nestjs
```

## Quick Start

### 1. Module Registration

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

### 2. Async Configuration

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

### 3. Using the Service

```typescript
import { Injectable } from '@nestjs/common';
import { NineJaPayService } from '9japay-nestjs';

@Injectable()
export class PaymentService {
  constructor(private readonly nineJaPayService: NineJaPayService) {}

  async createVirtualAccount(accountName: string) {
    const response = await this.nineJaPayService.createPermanentVirtualAccount({
      requestReference: `ref-${Date.now()}`,
      accountName,
      autoPayoutEnabled: true,
    });

    return response;
  }

  async makeTransfer(transferData: any) {
    // First, validate the recipient account
    const nameEnquiry = await this.nineJaPayService.nameEnquiry({
      bankCode: transferData.bankCode,
      accountNumber: transferData.accountNumber,
    });

    if (nameEnquiry.status === 'SUCCESS') {
      // Proceed with transfer
      const transfer = await this.nineJaPayService.transfer({
        paymentReference: `pay-${Date.now()}`,
        senderAccountNumber: transferData.senderAccountNumber,
        senderAccountName: transferData.senderAccountName,
        recipientAccountNumber: transferData.accountNumber,
        recipientAccountName: nameEnquiry.data.accountName,
        recipientBankCode: transferData.bankCode,
        amount: transferData.amount.toString(),
        nameEnquiryReference: nameEnquiry.data.nameEnquiryReference,
        narration: transferData.narration,
      });

      return transfer;
    }
  }
}
```

## API Reference

### Virtual Account Management

#### Permanent Virtual Accounts

```typescript
// Create permanent virtual account
await nineJaPayService.createPermanentVirtualAccount({
  requestReference: 'unique-ref-123',
  accountName: 'John Doe Account',
  autoPayoutEnabled: true,
});

// Update permanent virtual account
await nineJaPayService.updatePermanentVirtualAccount('9000001234', {
  accountName: 'Updated Account Name',
  blockStatus: false,
  autoPayoutEnabled: false,
});

// Get single permanent virtual account
await nineJaPayService.getPermanentVirtualAccount('9000001234');

// Get all permanent virtual accounts
await nineJaPayService.getAllPermanentVirtualAccounts({
  pageSize: 10,
  pageNumber: 1,
});

// Close permanent virtual account
await nineJaPayService.closePermanentVirtualAccount({
  requestReference: 'close-ref-123',
  accountNumber: '9000001234',
  reasonForClosure: 'Account no longer needed',
});
```

#### Transient Virtual Accounts

```typescript
// Create transient virtual account
await nineJaPayService.createTransientVirtualAccount({
  requestReference: 'temp-ref-123',
  timeToLive: '3600', // 1 hour in seconds
  amount: 100000, // Amount in kobo (optional)
  isSinglePayment: true,
});

// Update transient virtual account
await nineJaPayService.updateTransientVirtualAccount('9000001234', {
  blockStatus: false,
});

// Get single transient virtual account
await nineJaPayService.getTransientVirtualAccount('9000001234');

// Get all transient virtual accounts
await nineJaPayService.getAllTransientVirtualAccounts({
  pageSize: 10,
  pageNumber: 1,
});
```

#### General Virtual Account Operations

```typescript
// Get all virtual accounts (both permanent and transient)
await nineJaPayService.getAllVirtualAccounts({
  pageSize: 20,
  pageNumber: 1,
});

// Get single virtual account (regardless of type)
await nineJaPayService.getVirtualAccount('9000001234');

// Get account balance
await nineJaPayService.getAccountBalance('9000001234');

// Get total balance summary
await nineJaPayService.getTotalBalanceSummary();
```

### Transfers

```typescript
// Get list of banks
const banks = await nineJaPayService.getBankList();

// Perform name enquiry
const nameEnquiry = await nineJaPayService.nameEnquiry({
  bankCode: '057',
  accountNumber: '1234567890',
});

// Transfer from regular account
await nineJaPayService.transfer({
  paymentReference: 'pay-ref-123',
  senderAccountNumber: '3000001234',
  senderAccountName: 'Sender Name',
  recipientAccountNumber: '1234567890',
  recipientAccountName: 'Recipient Name',
  recipientBankCode: '057',
  amount: '100000', // Amount in kobo
  nameEnquiryReference: nameEnquiry.data.nameEnquiryReference,
  narration: 'Payment for services',
});

// Transfer from virtual account
await nineJaPayService.transferFromVirtualAccount({
  // Same parameters as above
});

// Check transaction status
await nineJaPayService.getTransactionStatus('pay-ref-123');
```

### Transactions

```typescript
// Get transactions with filters
await nineJaPayService.getTransactions({
  pageSize: 10,
  pageNumber: 1,
  accountNumber: '9000001234', // optional
  startDate: '2024-01-01', // optional
  endDate: '2024-12-31', // optional
});

// Get single transaction by ID
await nineJaPayService.getTransactionById('transaction-id-123');

// Resend failed notification for a transaction
await nineJaPayService.resendNotification({
  transactionId: 'transaction-id-123',
});

// Resend all failed notifications for an account
await nineJaPayService.resendNotificationsForAccount({
  accountNumber: '9000001234',
});

// Resend all failed notifications
await nineJaPayService.resendAllNotifications();

// Simulate deposit (sandbox only)
await nineJaPayService.simulateDeposit({
  recipientAccountNumber: '9000001234',
  amount: '100000',
  authKey: 'test-auth-key',
});
```

## Configuration Options

```typescript
interface _9JaPayConfig {
  apiKey: string;           // Your 9jaPay API key
  secretKey: string;        // Your 9jaPay secret key
  environment: 'sandbox' | 'production'; // Environment
  baseUrl?: string;         // Optional custom base URL
  rejectUnauthorized?: boolean; // Optional: Set to false for local testing to ignore SSL cert errors (default: true)
}
```

### Local Testing Configuration

For local testing environments where you might encounter SSL certificate issues, you can disable SSL verification:

```typescript
NineJaPayModule.register({
  apiKey: 'your-api-key',
  secretKey: 'your-secret-key',
  environment: 'sandbox',
  rejectUnauthorized: false, // Disable SSL verification for local testing
})
```

⚠️ **Security Warning**: Only use `rejectUnauthorized: false` in development/testing environments. Never use this in production!

## Environment URLs

- **Sandbox**: `https://test.developer.9japay.com/v1/api`
- **Production**: `https://developer.9japay.com/v1/api`

## Error Handling

The SDK provides comprehensive error handling with two types of exceptions:

### 1. NineJaPayException (Recommended)

For 9jaPay API errors, the SDK throws `NineJaPayException` which properly maps 9jaPay status codes to HTTP status codes:

```typescript
import { NineJaPayException } from '9japay-nestjs';

try {
  const result = await nineJaPayService.createPermanentVirtualAccount({
    requestReference: 'duplicate-ref',
    accountName: 'Test Account',
    autoPayoutEnabled: true,
  });
} catch (error) {
  if (error instanceof NineJaPayException) {
    console.log('9jaPay Status Code:', error.nineJaPayStatusCode); // "26"
    console.log('HTTP Status Code:', error.getStatus()); // 409
    console.log('Message:', error.message); // "Duplicate record found."
    console.log('Full Response:', error.nineJaPayResponse);
    
    // Handle specific 9jaPay errors
    switch (error.nineJaPayStatusCode) {
      case '26':
        // Handle duplicate record
        console.log('Duplicate record detected');
        break;
      case '25':
        // Handle no record found
        console.log('Record not found');
        break;
      case '09':
        // Handle validation error
        console.log('Validation failed');
        break;
      default:
        console.log('Other 9jaPay error');
    }
  }
}
```

### 2. Standard _9JaPayError

For network errors or other issues:

```typescript
try {
  const result = await nineJaPayService.createPermanentVirtualAccount({
    requestReference: 'ref-123',
    accountName: 'Test Account',
    autoPayoutEnabled: true,
  });
} catch (error) {
  console.error('Error:', error.message);
  console.error('9jaPay Status Code:', error.nineJaPayStatusCode);
  console.error('HTTP Status Code:', error.httpStatusCode);
  console.error('Response:', error.response);
}
```

### Error Response Structure

When using `NineJaPayException`, the error response structure is:

```typescript
{
  statusCode: 409,              // HTTP status code (for proper REST API responses)
  message: "Duplicate record found.",
  nineJaPayStatusCode: "26",    // 9jaPay's business logic status code
  nineJaPayResponse: {          // Full 9jaPay response
    status: "FAILED",
    message: "Duplicate record found.",
    statusCode: "26"
  }
}
```

## Response Codes

The SDK maps 9jaPay status codes to appropriate HTTP status codes:

| 9jaPay Code | Description | HTTP Status | HTTP Code |
|-------------|-------------|-------------|-----------|
| 00 | Success | OK | 200 |
| 01 | Processing | Accepted | 202 |
| 06 | General error | Internal Server Error | 500 |
| 09 | Validation error | Bad Request | 400 |
| 25 | No record found | Not Found | 404 |
| 26 | Duplicate record | Conflict | 409 |

### Status Code Usage

- **9jaPay Code**: Used for business logic and specific error handling
- **HTTP Status**: Used for REST API responses and proper HTTP semantics
- **Both codes are available** in the `NineJaPayException` for comprehensive error handling

## Development

### Building the Package

```bash
npm run build
```

### Running Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Check the [9jaPay API Documentation](https://docs.9japay.com/docs/intro)

## Changelog

### v1.0.2
- **Enhanced Error Handling**: Added `NineJaPayException` class with proper HTTP status code mapping
- **Fixed Status Code Conflict**: Separated 9jaPay status codes from HTTP status codes to prevent `ERR_HTTP_INVALID_STATUS_CODE`
- **Improved Error Structure**: Better error response format with both business logic and HTTP codes
- **Status Code Mapping**: Automatic mapping of 9jaPay codes (e.g., "26") to appropriate HTTP codes (e.g., 409)

### v1.0.1
- **Global Module**: Made module global to resolve dependency injection issues
- **Fix**: Service now available throughout application without additional imports

### v1.0.0
- Initial release
- Complete API coverage
- TypeScript support
- NestJS integration
- Unit tests
- Comprehensive documentation
