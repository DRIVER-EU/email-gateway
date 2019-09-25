
import { EventEmitter } from 'events';
import { ITestBedAdapterSettings } from './test-bed-kafka-service';
import { ISmtpSettings, IMapSettings } from './mail-service';

/*

Service to get all configuration.

The package https://www.npmjs.com/package/nconf is used for this.

*/
const path = require('path');
const nconf = require('nconf');
const Yargs = require('yargs');
const fs = require('fs');

// const CONFIG_DIR = Path.join(__dirname, '../config');



export interface IConfigService {
    SmtpSettings: ISmtpSettings;
    KafkaSettings: ITestBedAdapterSettings;
    IMapSettings: IMapSettings;
    NestServerPortNumber: number;
    LargFileServiceUrl: string;
    ApiMailServerUrl: string;
}

export class ConfigService extends EventEmitter implements IConfigService {


    constructor() {
        super();

        // Setup nconf to use (in-order):
        //   1. Command-line arguments
        //   2. Environment variables
        //   3. A file


        const cfgFileName = 'gateway-config.json';
        nconf
        .argv({
            'c': {
              alias: 'config',
              describe: 'Set configuration file',
              demand: false,
              default: cfgFileName,
              parseValues: true,
              transform: function(obj: any) {
                return obj;
              }
            }
          })
        .env({
          separator: '_', // Replace : with _ since : is not allowed
          // whitelist: ['']
        })
        .file('generic', { file: path.join(process.cwd(), nconf.get('config')) })
        .defaults({
        });

        const cfgFile = path.join(process.cwd(), nconf.get('config'));
        console.log(`Use configuration file '${cfgFile}'.`);

        try {
            if (!fs.existsSync(cfgFile)) console.error(`Configuration file $(cfgFile) not found.`);
          } catch (err) {

          }


        // Set general CLI options
    let yargs = Yargs
    .usage('Usage: npm run start:prod ')
    .example('npm run start:prod --config config-custom.json', 'Use non default config file.')
    .help('h')
    .alias('h', 'help')
    .epilog('Driver-eu')
    .argv;


    }

    get NestServerPortNumber(): number {
        return nconf.get('server:port') || 7891;
    }

    get LargFileServiceUrl(): string {
      return nconf.get('LargeFileServiceUrl') || nconf.get('server:LargeFileServiceUrl') || 'http://localhost:9090/upload';
    }

    get ApiMailServerUrl(): string {
      return nconf.get('ApiMailServerUrl') || nconf.get('server:ApiMailServerUrl') || 'http://localhost:3000';
    }

    get KafkaSettings(): ITestBedAdapterSettings {
        // TODO boolean are string because type boolean fails.

        const connect = (nconf.get('kafka:connectToKafka')) ? (nconf.get('kafka:connectToKafka') === 'true')  : true;
        const register = (nconf.get('kafka:autoRegisterSchemas')) ? (nconf.get('kafka:autoRegisterSchemas') === 'true')  : true;
        let result: ITestBedAdapterSettings = {
            kafkaHost:  nconf.get('kafka:kafkaHost') || 'localhost:3501',
            schemaRegistryUrl: nconf.get('kafka:schemaRegistryUrl') || 'localhost:3502',
            autoRegisterSchemas: register,
            kafkaClientId: nconf.get('kafka:clientid') || 'MailGatewayService',
            mediaTopicName: nconf.get('kafka:mediaTopicName') || 'Media',
            connectToKafka: connect
        };
        return result;
    }

    get SmtpSettings(): ISmtpSettings {
      let result: ISmtpSettings = {
          SmtpHost:  nconf.get('SmtpHost') || nconf.get('mail:SmtpHost') || 'localhost',
          SmtpPort:  nconf.get('SmtpPort') || nconf.get('mail:SmtpPort') || '25',

      };
      return result;
  }

  get IMapSettings(): IMapSettings {
    let result: IMapSettings = {
        IMapHost:   nconf.get('IMapHost') || nconf.get('mail:IMapHost') || 'localhost',
        IMapPort:   nconf.get('IMapPort') || nconf.get('mail:IMapPort') || '993'

    };
    return result;
}
}
