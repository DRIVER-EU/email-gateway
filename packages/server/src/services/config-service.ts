import { EventEmitter } from "events";
import { ITestBedAdapterSettings } from "./test-bed-kafka-service.js";
import { ISmtpSettings, IMapSettings } from "./mail-service.js";

/*

Service to get all configuration.

The package https://www.npmjs.com/package/nconf is used for this.

*/
import fs from "fs";
import path from "path";
import nconf from "nconf";
import yargs from "yargs";

// const CONFIG_DIR = Path.join(cwd(), '../config');

export interface IConfigService {
  SmtpSettings: ISmtpSettings;
  KafkaSettings: ITestBedAdapterSettings;
  IMapSettings: IMapSettings;
  NestServerPortNumber: number;
  WebsockNotificationPort: number;
  LargFileServiceUrl: string;
  ApiMailServerUrl: string;
  MailCheckIntervalInSeconds: number;
  DefaultMailPassword: string;
}

export class ConfigService extends EventEmitter implements IConfigService {
  constructor() {
    super();

    // Setup nconf to use (in-order):
    //   1. Command-line arguments
    //   2. Environment variables
    //   3. A file

    const cfgFileName = "gateway-config.json";
    nconf
      .argv({
        c: {
          alias: "config",
          describe: "Set configuration file",
          demand: false,
          default: cfgFileName,
          parseValues: true,
          transform: function (obj: any) {
            return obj;
          },
        },
      })
      .env({
        separator: "_", // Replace : with _ since : is not allowed
        // whitelist: ['']
      })
      .file("generic", { file: path.join(process.cwd(), nconf.get("config")) })
      .defaults({});

    const cfgFile = path.join(process.cwd(), nconf.get("config"));
    console.log(`Use configuration file '${cfgFile}'.`);

    try {
      if (!fs.existsSync(cfgFile))
        console.error(
          `Configuration file ${cfgFile} not found, fallback to default values (and enviroment var.).`
        );
    } catch (err) {}

    // Set general CLI options
    const argv = yargs("Usage: npm run start:prod ")
      .example(
        "npm run start:prod --config config-custom.json",
        "Use non default config file."
      )
      .help("h")
      .alias("h", "help")
      .epilog("Driver-eu").argv;
    console.log("Args are: ", argv);
  }

  get MailCheckIntervalInSeconds(): number {
    return nconf.get("MailCheckIntervalInSeconds") || 60;
  }

  get DefaultMailPassword(): string {
    return nconf.get("DefaultMailPassword") || "default";
  }

  get NestServerPortNumber(): number {
    return nconf.get("server:port") || 7891;
  }

  get WebsockNotificationPort(): number {
    return nconf.get("server:WebsocketNotificationPort") || 9996;
  }

  get LargFileServiceUrl(): string {
    return (
      nconf.get("LargeFileServiceUrl") ||
      nconf.get("server:LargeFileServiceUrl") ||
      "http://localhost:9090/upload"
    );
  }

  get ApiMailServerUrl(): string {
    return (
      nconf.get("ApiMailServerUrl") ||
      nconf.get("server:ApiMailServerUrl") ||
      "http://localhost:3000/mailapi"
    );
  }

  get KafkaSettings(): ITestBedAdapterSettings {
    // TODO boolean are string because type boolean fails.

    const connect = nconf.get("kafka:connectToKafka")
      ? nconf.get("kafka:connectToKafka") === "true"
      : true;
    const register = nconf.get("kafka:autoRegisterSchemas")
      ? nconf.get("kafka:autoRegisterSchemas") === "true"
      : true;
    let result: ITestBedAdapterSettings = {
      kafkaHost: nconf.get("kafka:kafkaHost") || "localhost:3501",
      schemaRegistryUrl:
        nconf.get("kafka:schemaRegistryUrl") || "localhost:3502",
      autoRegisterSchemas: register,
      kafkaClientId: nconf.get("kafka:clientid") || "MailGatewayService",
      mediaTopicName:
        nconf.get("kafka:mediaTopicName") || "simulation_entity_post",
      connectToKafka: connect,
    };
    return result;
  }

  get SmtpSettings(): ISmtpSettings {
    let result: ISmtpSettings = {
      SmtpHost:
        nconf.get("SmtpHost") || nconf.get("mail:SmtpHost") || "localhost",
      SmtpPort: nconf.get("SmtpPort") || nconf.get("mail:SmtpPort") || "25",
    };
    return result;
  }

  get IMapSettings(): IMapSettings {
    let result: IMapSettings = {
      IMapHost:
        nconf.get("IMapHost") || nconf.get("mail:IMapHost") || "localhost",
      IMapPort: nconf.get("IMapPort") || nconf.get("mail:IMapPort") || "993",
    };
    return result;
  }
}
