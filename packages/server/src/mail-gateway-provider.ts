
import { ILogService, LogService } from './services/log-service';
import { IMailService, MailService } from './services/mail-service'; 
import { IConfigService, ConfigService } from './services/config-service';
import { ITestBedKafkaService, TestBedKafkaService } from './services/test-bed-kafka-service';
import { posts } from './testdata'

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


    constructor() {
        // Setup services:
        this.logService = new LogService();
        this.configService = new ConfigService();
        this.kafkaTestBedService = new TestBedKafkaService(this.logService, this.configService);
        this.mailGatewayService = new MailService(this.logService, this.configService, this.kafkaTestBedService);
        this.kafkaTestBedService.on('ready', () => {
            console.log('');
            this.kafkaTestBedService.send(posts);
        });
        this.kafkaTestBedService.ConnectToKafka();
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


}