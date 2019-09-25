
import { ILogService, LogService } from './services/log-service';
import { IMailService, MailService } from './services/mail-service';
import { IConfigService, ConfigService } from './services/config-service';
import { ITestBedKafkaService, TestBedKafkaService } from './services/test-bed-kafka-service';
import { posts } from './testdata';
import { IPostfixMailServerManagementService, PostfixMailServerManagementService } from './services/postfix-mailserver-management';
import { INotificationService, NotificationService } from './services/notification-service';
import * as npmPackage from './../package.json';
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

    private serverStarted = new Date();

    constructor() {
        // Setup services:
        this.logService = new LogService();
        this.configService = new ConfigService();
        this.kafkaTestBedService = new TestBedKafkaService(this.logService, this.configService);
        this.postfixService = new PostfixMailServerManagementService(this.logService, this.configService);
        this.mailGatewayService = new MailService(this.logService, this.configService, this.kafkaTestBedService, this.postfixService);
        this.kafkaTestBedService.on('ready', () => {
            // this.kafkaTestBedService.sendSimulationEntityPostToKafka(posts);
        });
        this.kafkaTestBedService.connectToKafka();
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

    public GetStatus(): any {
        const smtpCfg = this.ConfigService.SmtpSettings;
        const imapCfg = this.ConfigService.IMapSettings;
        const kafkaCfg = this.ConfigService.KafkaSettings;
        return {
             service: {
                 package: npmPackage.name,
                 version: npmPackage.version,
                 description: npmPackage.description
             },
             server: {
                 largeFileServiceUrl: this.ConfigService.LargFileServiceUrl,
                 mailserverApiUrl: this.ConfigService.ApiMailServerUrl,
                 serverRestPort: this.ConfigService.NestServerPortNumber
             },
             smtp: smtpCfg,
             imap: imapCfg,
             kafka: kafkaCfg,
             status: {
                 serverstarted: this.serverStarted,
                 connectedToKafka: this.TestBedKafkaService.isConnectedToKafka,
                 receivedKafkaPost: this.TestBedKafkaService.numberOfReceivedSimEnityPost,
                 sendKafkaPost: this.TestBedKafkaService.numberOfSendSimEnityPost
             }
        };
    }

}