"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryFlexible = retryFlexible;
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('RetryUtility');
async function retryFlexible(fn, config, label = 'operation') {
    const maxAttempts = parseInt(config.get('MAX_RETRIES', '3'), 10);
    const delayMs = parseInt(config.get('RETRY_DELAY_MS', '500'), 10);
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await Promise.resolve(fn());
            return result;
        }
        catch (err) {
            lastError = err;
            logger.warn(`[Retry][${label}] Attempt ${attempt} failed: ${err.message}`);
            if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }
    logger.error(`[Retry][${label}] All ${maxAttempts} attempts failed.`);
    throw lastError;
}
//# sourceMappingURL=resilience-utils.js.map