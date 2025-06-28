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
var RabbitTaskCreatedEventPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitTaskCreatedEventPublisher = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
let RabbitTaskCreatedEventPublisher = RabbitTaskCreatedEventPublisher_1 = class RabbitTaskCreatedEventPublisher {
    config;
    logger = new common_1.Logger(RabbitTaskCreatedEventPublisher_1.name);
    channel;
    connection;
    constructor(config) {
        this.config = config;
    }
    async onModuleInit() {
        const uri = `amqp://${this.config.get('RABBITMQ_USER')}:${this.config.get('RABBITMQ_PASSWORD')}@${this.config.get('RABBITMQ_HOST')}:${this.config.get('RABBITMQ_PORT')}`;
        this.connection = await amqp.connect(uri);
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange('task.events', 'topic', { durable: true });
    }
    async publish(event) {
        const payload = JSON.stringify(event);
        this.channel.publish('task.events', 'task.created', Buffer.from(payload), {
            contentType: 'application/json',
        });
        this.logger.log(`Published event to RabbitMQ: task.created`);
    }
};
exports.RabbitTaskCreatedEventPublisher = RabbitTaskCreatedEventPublisher;
exports.RabbitTaskCreatedEventPublisher = RabbitTaskCreatedEventPublisher = RabbitTaskCreatedEventPublisher_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RabbitTaskCreatedEventPublisher);
//# sourceMappingURL=rabbit-task-created-event.publisher.js.map