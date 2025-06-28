"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CustomHealthIndicator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const terminus_1 = require("@nestjs/terminus");
const ioredis_1 = require("ioredis");
const amqplib = require("amqplib");
const resilience_utils_1 = require("../../utils/resilience-utils");
let CustomHealthIndicator = CustomHealthIndicator_1 = class CustomHealthIndicator extends terminus_1.HealthIndicator {
    config;
    logger = new common_1.Logger(CustomHealthIndicator_1.name);
    constructor(config) {
        super();
        this.config = config;
    }
    async isRedisHealthy() {
        const redis = new ioredis_1.default({
            host: this.config.get('REDIS_HOST'),
            port: Number(this.config.get('REDIS_PORT')),
        });
        try {
            await (0, resilience_utils_1.retryFlexible)(() => redis.ping(), this.config, 'Redis Ping');
            redis.disconnect();
            return this.getStatus('redis', true);
        }
        catch (err) {
            redis.disconnect();
            this.logger.error(`Redis health check failed: ${err.message}`);
            throw new terminus_1.HealthCheckError('Redis check failed', this.getStatus('redis', false));
        }
    }
    async isRabbitHealthy() {
        const uri = `amqp://${this.config.get('RABBITMQ_USER')}:${this.config.get('RABBITMQ_PASSWORD')}@${this.config.get('RABBITMQ_HOST')}:${this.config.get('RABBITMQ_PORT')}`;
        try {
            await (0, resilience_utils_1.retryFlexible)(async () => {
                const conn = await amqplib.connect(uri);
                await conn.close();
            }, this.config, 'RabbitMQ Connect');
            return this.getStatus('rabbitmq', true);
        }
        catch (err) {
            this.logger.error(`RabbitMQ health check failed: ${err.message}`);
            throw new terminus_1.HealthCheckError('RabbitMQ check failed', this.getStatus('rabbitmq', false));
        }
    }
};
exports.CustomHealthIndicator = CustomHealthIndicator;
exports.CustomHealthIndicator = CustomHealthIndicator = CustomHealthIndicator_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CustomHealthIndicator);
//# sourceMappingURL=health.service.js.map