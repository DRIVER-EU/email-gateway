
import { ILogService, LogService } from './services/log-service';
import { IMailService, MailService } from './services/mail-service';
import { IConfigService, ConfigService } from './services/config-service';
import { ITestBedKafkaService, TestBedKafkaService } from './services/test-bed-kafka-service';
import { posts } from './testdata';
import { IPostfixMailServerManagementService, PostfixMailServerManagementService } from './services/postfix-mailserver-management';
import { INotificationService, NotificationService } from './services/notification-service';

import { NestExpressApplication } from '@nestjs/platform-express';
/*
The GeofencerProvider creates all services (all services are event driven).
- kafkaTestBedService: handles all KAFKA messages
- configService: all settings used in this server (combined from file / commandline and environment )
- logService: central point for logging
- geoFencerService: the service for monitoring simulator 'Item' and notifiy when triggers are hit

*/

export class MailGatewayProvider {
    private logService: ILogService;
    private configService: IConfigService;
    private mailGatewayService: IMailService;
    private kafkaTestBedService: ITestBedKafkaService;
    private postfixService: IPostfixMailServerManagementService;
    private notificationService: INotificationService;

    constructor() {
        // Setup services:
        this.logService = new LogService();
        this.configService = new ConfigService();
        this.kafkaTestBedService = new TestBedKafkaService(this.logService, this.configService);
        this.postfixService = new PostfixMailServerManagementService(this.logService, this.configService);
        this.mailGatewayService = new MailService(this.logService, this.configService, this.kafkaTestBedService, this.postfixService);
        this.kafkaTestBedService.on('ready', () => {
            this.kafkaTestBedService.send(posts);
        });
        this.kafkaTestBedService.ConnectToKafka();
    }

    public SetServer(server: NestExpressApplication) {
        this.notificationService = server.get(NotificationService);
        this.logService.setNotificationService(this.notificationService);
    }

    get LogService() {
        return this.logService;
    }

    get ConfigService() {
        return this.configService;
    }

    get TestBedKafkaService() {
        return this.kafkaTestBedService;
    }

    get MailGatewayService() {
        return this.mailGatewayService;
    }

    get PostfixService() {
        return this.postfixService;
    }

    get NotificationService() {
        return this.notificationService;
    }

}