
import { EventEmitter } from 'events';
import { ITestBedAdapterSettings } from './test-bed-kafka-service'
import { IMailSettings } from './mail-service';

/* 

Service to get all configuration.

The package https://www.npmjs.com/package/nconf is used for this.

*/
const Path = require('path');
const nconf = require('nconf');
const Yargs = require('yargs');
const fs = require('fs')

// const CONFIG_DIR = Path.join(__dirname, '../config');



export interface IConfigService {
    MailSettings: IMailSettings;
    KafkaSettings: ITestBedAdapterSettings;
    NestServerPortNumber : number;
}

export class ConfigService extends EventEmitter implements IConfigService {

   
    constructor() {
        super();
       
        // Setup nconf to use (in-order):
        //   1. Command-line arguments
        //   2. Environment variables
        //   3. A file 


        const cfgFileName= "gateway-config.json";
        nconf
        .argv({
            "c": {
              alias: 'config',
              describe: 'Set configuration file',
              demand: false,
              default: cfgFileName,
              parseValues: true,
              transform: function(obj : any) {
                return obj;
              }
            }
          })
        .env()
        .file('generic', { file: `${process.cwd()}\\${nconf.get('config')}` })
        .defaults({
           
        });
       
        const cfgFile = `${process.cwd()}\\${nconf.get('config')}`;
        console.log(`Use configuration file '${cfgFile}'.`);

        try {
            if (!fs.existsSync(cfgFile)) console.error("Configuration file not found.");
          } catch(err) {
            
          }


        // Set general CLI options
    let yargs = Yargs
    .usage('Usage: npm run start:prod ')
    .example('npm run start:prod --config geofencer-config-custom.json', 'Use non default config file.')
    .help('h')
    .alias('h', 'help')
    .epilog('Driver-eu')
    .argv;
      
    

    }

    get NestServerPortNumber() : number {
        return nconf.get('server:port') || 7891;
    }

    get KafkaSettings() : ITestBedAdapterSettings {
        var result: ITestBedAdapterSettings =
        {
            kafkaHost:  nconf.get('kafka:kafkaHost') || "localhost:3501",
            schemaRegistryUrl: nconf.get('kafka:schemaRegistryUrl') || "localhost:3502",
            autoRegisterSchemas: nconf.get('kafka:autoRegisterSchemas') || true,
            kafkaClientId: nconf.get('kafka:clientid') || "MailGatewayService",
            mediaTopicName: nconf.get('kafka:mediaTopicName') || "Media"
        };
        return result;
    }

    get MailSettings() : IMailSettings {
      var result: IMailSettings =
      {
          SmtpHost:  nconf.get('mail:SmtpHost') || "localhost",
          SmtpPort:  nconf.get('mail:SmtpPort') || "25",
          SmtpUser:  nconf.get('mail:SmtpUser') || "hein@dockermail.drivereu.com",
          SmtpPassword:  nconf.get('mail:SmtpPassword') || "hein",

      };
      return result;
  }
}
