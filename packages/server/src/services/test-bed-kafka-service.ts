import { EventEmitter } from "events";
import {
  TestBedAdapter,
  LogLevel,
  AdapterLogger,
  AdapterMessage,
  AdapterProducerRecord,
  RecordMetadata,
} from "node-test-bed-adapter";
import { IPost } from "../models/avro_generated/simulation_entity_post-value.js";

// Services:
import { IConfigService } from "./config-service.js";
import { ILogService } from "./log-service.js";
// import { emit } from 'cluster';

import { GlobalConst } from "../global-const.js";
import path, { join, normalize } from "path";
import { cwd } from "node:process";
import { existsSync } from "fs";

// AVRO kafka schema's

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
  on(event: "SimulationEntityPostMsg", listener: (media: IPost) => void): this;
  on(event: "ready", listener: () => void): this;
  connectToKafka(): void;
  Settings: ITestBedAdapterSettings;
  sendSimulationEntityPostToKafka(posts: IPost | IPost[]): void;
  isConnectedToKafka(): boolean;
  numberOfReceivedSimEnityPost: number;
  numberOfSendSimEnityPost: number;
}

export class TestBedKafkaService
  extends EventEmitter
  implements ITestBedKafkaService
{
  private kafkaSettings: ITestBedAdapterSettings;
  private adapter: TestBedAdapter;
  private log = AdapterLogger.instance;

  private receivedSimEnityPost = 0;
  private sendSimEnityPost = 0;

  constructor(
    private logService: ILogService,
    private configService: IConfigService
  ) {
    super();

    const p = normalize(join(cwd(), "/../../../schemas/avro-schemas"));
    const schemaPath = existsSync(p) ? p : undefined;

    this.kafkaSettings = this.configService.KafkaSettings;
    this.logService.LogMessage(`Connect to KAFKA:`);
    this.logService.LogMessage(
      `- Hostname        ${this.kafkaSettings.kafkaHost}`
    );
    this.logService.LogMessage(
      `- Schema          ${this.kafkaSettings.schemaRegistryUrl}`
    );
    this.logService.LogMessage(
      `- Register schema ${this.kafkaSettings.autoRegisterSchemas}`
    );
    this.logService.LogMessage(`- Schema path     ${schemaPath || ""}`);
    this.logService.LogMessage(
      `- Client ID       ${this.kafkaSettings.kafkaClientId}`
    );
    this.logService.LogMessage(
      `- Media topic     ${this.kafkaSettings.mediaTopicName}`
    );

    this.adapter = new TestBedAdapter({
      kafkaHost: this.kafkaSettings.kafkaHost,
      schemaRegistry: this.kafkaSettings.schemaRegistryUrl,
      fetchAllSchemas: false,
      fetchAllVersions: false,
      wrapUnions: "auto",
      groupId: this.kafkaSettings.kafkaClientId,
      autoRegisterSchemas: true /* this.kafkaSettings.autoRegisterSchemas, */,
      schemaFolder: schemaPath,
      consume: [this.kafkaSettings.mediaTopicName],
      produce: [this.kafkaSettings.mediaTopicName],
      logging: {
        logToConsole: LogLevel.Info,
        logToKafka: LogLevel.Warn,
      },
    });

    this.adapter.on("ready", () => {
      this.emit("ready");
      this.logService.LogMessage(
        `Connected to Kafka Server '${this.kafkaSettings.kafkaHost}'. `
      );
      this.adapter.on("message", (message: AdapterMessage) =>
        this.HandleReceiveKafkaMessage(message)
      );
      this.adapter.on("error", (err: any) =>
        this.logService.LogErrorMessage(
          `KAFKA: Consumer received an error: ${err}`
        )
      );
      this.adapter.on("offsetOutOfRange", (err: any) =>
        this.logService.LogErrorMessage(
          `KAFKA: Consumer received an offsetOutOfRange error: ${err}`
        )
      );
    });
  }

  public connectToKafka(): void {
    if (this.Settings.connectToKafka) {
      this.logService.LogMessage(
        `Start connecting to Kafka Server '${this.kafkaSettings.kafkaHost}'.`
      );
      this.adapter.connect();
    } else {
      this.emit("ready");
      this.logService.LogMessage(`Connect to KAFKA disabled in configuration.`);
    }
  }

  public get Settings() {
    return this.kafkaSettings;
  }

  // Received a message on KAFKA bus
  private HandleReceiveKafkaMessage(message: AdapterMessage) {
    if (message.topic.startsWith("system_")) return;

    // Check topic name:
    switch (message.topic.toLowerCase()) {
      case this.Settings.mediaTopicName.toLowerCase():
        const post = message.value as IPost;
        if (post.owner === GlobalConst.mailOwner) {
          this.logService.LogMessage(
            `Received KAFKA Simulation Entity Post message ${post.id}; ignore because mail gateway was sender`
          );
        } else {
          const stringify = (m: string | Object) =>
            typeof m === "string" ? m : JSON.stringify(m, null, 2);
          message.key &&
            this.logService.LogMessage(
              `Received KAFKA message ${stringify(message.key)}: ${stringify(
                message.value
              )}`
            );
          this.receivedSimEnityPost++;
          this.emit("SimulationEntityPostMsg", message.value as IPost);
        }
        break;
      default:
        this.logService.LogMessage(
          `Received KAFKA topic ${message.topic}, ignore.`
        );
        break;
    }
  }

  public sendSimulationEntityPostToKafka(posts: IPost | IPost[]) {
    if (this.Settings.connectToKafka) {
      if (!(posts instanceof Array)) {
        posts = [posts];
      }
      posts.map((post: IPost) => {
        this.sendSimEnityPost++;
        const payload = {
          topic: this.Settings.mediaTopicName,
          attributes: 1 /* GZIP */,
          messages: [
            {
              key: post.id,
              value: post,
            },
          ],
        } as AdapterProducerRecord;
        this.logService.LogMessage(
          `Send SimulationEnityPost to KAFKA: ${JSON.stringify(
            payload,
            null,
            2
          )} `
        );
        this.adapter.send(
          payload,
          (err: any, data: RecordMetadata[] | undefined) => {
            if (err) {
              this.logService.LogErrorMessage(
                "Fatal error sending KAFKA message: " + err
              );
              // process.exit(1);
            } else {
              this.logService.LogMessage(
                `Reply from KAFKA: ${JSON.stringify(data, null, 2)} `
              );
            }
          }
        );
      });
    } else {
      this.logService.LogMessage("Kafka disabled in config, dont send post ");
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
