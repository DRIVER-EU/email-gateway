import { EventEmitter } from 'events';
import { TestBedAdapter, Logger, LogLevel, IAdapterMessage } from 'node-test-bed-adapter';
import { ISimulationEntityPost } from './../models/simulation-entity-post';
import { ProduceRequest } from 'kafka-node';

// Services:
import { IConfigService } from './config-service';
import { ILogService } from './log-service';
import { emit } from 'cluster';

// AVRO kafka schema's

let path = require('path');

// Configuration settings for this service
export interface ITestBedAdapterSettings {
  kafkaHost: string;
  schemaRegistryUrl: string;
  autoRegisterSchemas: boolean;
  kafkaClientId: string;
  mediaTopicName: string;
  connectToKafka: boolean;
}

export interface ITestBedKafkaService {
  // Fires when SimulationEntityPost is received
  on(event: 'SimulationEntityPostMsg', listener: (media: ISimulationEntityPost) => void): this;
  on(event: 'ready', listener: () => void): this;
  connectToKafka(): void;
  Settings: ITestBedAdapterSettings;
  sendSimulationEntityPostToKafka(posts: ISimulationEntityPost | ISimulationEntityPost[]): void;
  isConnectedToKafka(): boolean;
  numberOfReceivedSimEnityPost: number;
  numberOfSendSimEnityPost: number;
}

export class TestBedKafkaService extends EventEmitter implements ITestBedKafkaService {

  private kafkaSettings: ITestBedAdapterSettings;
  private adapter: TestBedAdapter;
  private log = Logger.instance;

  private receivedSimEnityPost = 0;
  private sendSimEnityPost = 0;

  constructor(
    private logService: ILogService,
    private configService: IConfigService) {
    super();

    const schemaPath = path.normalize(path.join(__dirname, '/../../../schemas/avro-schemas'));

    this.kafkaSettings = this.configService.KafkaSettings;
    this.logService.LogMessage(`Connect to KAFA:`);
    this.logService.LogMessage(`- Hostname        ${this.kafkaSettings.kafkaHost}`);
    this.logService.LogMessage(`- Schema          ${this.kafkaSettings.schemaRegistryUrl}`);
    this.logService.LogMessage(`- Register schema ${this.kafkaSettings.autoRegisterSchemas}`);
    this.logService.LogMessage(`- Schema path     ${schemaPath}`);
    this.logService.LogMessage(`- Client ID       ${this.kafkaSettings.kafkaClientId}`);
    this.logService.LogMessage(`- Media topic     ${this.kafkaSettings.mediaTopicName}`);


    this.adapter = new TestBedAdapter({
      kafkaHost: this.kafkaSettings.kafkaHost,
      schemaRegistry: this.kafkaSettings.schemaRegistryUrl,
      fetchAllSchemas: false,
      fetchAllVersions: false,
      wrapUnions: 'auto',
      clientId: this.kafkaSettings.kafkaClientId,
      autoRegisterSchemas: true /* this.kafkaSettings.autoRegisterSchemas, */,
      schemaFolder: schemaPath,
      consume: [{ topic: this.kafkaSettings.mediaTopicName  } ],
      produce: [this.kafkaSettings.mediaTopicName ],
      logging: {
        logToConsole: LogLevel.Info,
        logToKafka: LogLevel.Warn,
      },
    });

    this.adapter.on('ready', () => {
      this.emit('ready');
      this.logService.LogMessage(`Connected to Kafka Server '${this.kafkaSettings.kafkaHost}'. `);
      this.adapter.on('message', (message) => this.HandleReceiveKafkaMessage(message));
      this.adapter.on('error', (err) => this.logService.LogErrorMessage(`KAFKA: Consumer received an error: ${err}`));
      this.adapter.on('offsetOutOfRange', (err) => this.logService.LogErrorMessage(`KAFKA: Consumer received an offsetOutOfRange error: ${err}`));
    });
  }

  public connectToKafka(): void {
    if (this.Settings.connectToKafka) {
      this.logService.LogMessage(`Start connecting to Kafka Server '${this.kafkaSettings.kafkaHost}'.`);
      this.adapter.connect();
    } else {
      this.logService.LogMessage(`Connect to KAFKA diabled in configuration.`);
    }
  }

  public get Settings() {
    return this.kafkaSettings;
  }


  // Received a message on KAFKA bus
  private HandleReceiveKafkaMessage(message: IAdapterMessage) {
    if (message.topic.startsWith('system_')) return;
    const stringify = (m: string | Object) => typeof m === 'string' ? m : JSON.stringify(m, null, 2);
    // this.logService.LogMessage(`Received KAFKA message ${stringify(message.key)}: ${stringify(message.value)}`);
    // Check topic name:
    switch (message.topic.toLowerCase()) {
      case this.Settings.mediaTopicName.toLowerCase():
        this.receivedSimEnityPost++;
        this.emit('SimulationEntityPostMsg', message.value as ISimulationEntityPost);
        break;
      default:
        this.logService.LogMessage(`Received KAFKA topic ${message.topic}, ignore.`);
        break;
    }
  }

  public sendSimulationEntityPostToKafka(posts: ISimulationEntityPost | ISimulationEntityPost[]) {
    if (this.Settings.connectToKafka) {
      if (!(posts instanceof Array)) {
        posts = [posts];
      }
      posts.map((post: ISimulationEntityPost) => {
        this.sendSimEnityPost++;
        const payload = {
          topic: this.Settings.mediaTopicName,
          attributes: 1 /* GZIP */,
          messages: post,
        } as ProduceRequest;
        this.logService.LogMessage(`Send SimulationEnityPost to KAFKA: ${JSON.stringify(payload, null, 2)} `);
        this.adapter.send(payload, (err, data) => {
          if (err) {
            this.logService.LogErrorMessage('Fatal error sending KAFKA message: ' + err);
            // process.exit(1);
          } else {
            this.logService.LogMessage(`Reply KAFKA: ${JSON.stringify(data, null, 2)} `);
          }
        });
      });
    } else {
      this.logService.LogMessage('Kafka disabled in config, dont send post ');
    }
  }

  isConnectedToKafka(): boolean {
    return this.adapter.isConnected;
  }

  get numberOfReceivedSimEnityPost(): number {
    return this.receivedSimEnityPost;
  }

  get numberOfSendSimEnityPost(): number {
    return this.sendSimEnityPost;
  }
}
