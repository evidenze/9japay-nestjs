import { DynamicModule, Module } from '@nestjs/common';
import { _9JaPayService } from '../services/nine-ja-pay.service';
import { _9JaPayConfig } from '../interfaces';
import { NINE_JA_PAY_CONFIG } from '../constants';

@Module({})
export class _9JaPayModule {
  static register(config: _9JaPayConfig): DynamicModule {
    return {
      module: _9JaPayModule,
      global: true,
      providers: [
        {
          provide: NINE_JA_PAY_CONFIG,
          useValue: config,
        },
        _9JaPayService,
      ],
      exports: [_9JaPayService],
    };
  }

  static registerAsync(options: {
    useFactory: (...args: any[]) => Promise<_9JaPayConfig> | _9JaPayConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: _9JaPayModule,
      global: true,
      providers: [
        {
          provide: NINE_JA_PAY_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        _9JaPayService,
      ],
      exports: [_9JaPayService],
    };
  }
}
