import { ConfigService } from '@nestjs/config';
export declare function retryFlexible<T>(fn: () => T | Promise<T>, config: ConfigService, label?: string): Promise<T>;
