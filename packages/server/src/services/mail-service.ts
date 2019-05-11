
// Services:
import { IConfigService } from './config-service';
import { ILogService } from './log-service';
import { ITestBedKafkaService } from './test-bed-kafka-service'
import { ISimulationEntityPost, MediumTypes } from './../models/simulation-entity-post'

import * as nodemailer from "nodemailer";

import { Transporter, Transport, SendMailOptions as MailEnvelop } from 'nodemailer';
import { Options as SmtpOptions } from 'nodemailer/lib/smtp-transport'

// https://community.nodemailer.com/

// Configuration settings for this service
export interface IMailSettings {
  SmtpHost: string;
  SmtpPort: number;
  SmtpUser: string;
  SmtpPassword : string;
}

export interface IMailService {

}

export class MailService implements IMailService {

  private smtpConnection : Transporter;
  private settings : IMailSettings;

  constructor(
    private logService: ILogService,
    private configService: IConfigService,
    private kafkaService: ITestBedKafkaService) {
      this.settings = configService.MailSettings;
      this.kafkaService.on("SimulationEntityPostMsg", msg => this.HandleSimulationEntityPostMsg(msg));
      this.InitializeSmtpConnection()
      .then(() => {
        logService.LogMessage("Connected to the mail-sever");
      })
      .catch(err => {
        logService.LogErrorMessage("Failed to connected to the mail-sever");
       
    });


  }


  private HandleSimulationEntityPostMsg(msg : ISimulationEntityPost) {
      if (msg.mediumType === MediumTypes.MAIL) {

      }
  }



  async InitializeSmtpConnection()  {

    this.logService.LogMessage(`Connecting to SMTP server ${this.settings.SmtpHost} on port ${this.settings.SmtpPort} as user ${this.settings.SmtpUser}`);
    // Create a SMTP transporter object
    const options : SmtpOptions = {
        host: this.settings.SmtpHost,
        port: this.settings.SmtpPort,
        secure: false,// use TLS
        requireTLS: true,
        auth: {
                user: this.settings.SmtpUser,
                pass: this.settings.SmtpPassword
        },
        logger: true,
        debug: true,
        tls: {
        //   do not fail on invalid certs
          rejectUnauthorized: false
        }
    } ;
    this.smtpConnection = nodemailer.createTransport(options);
  
    // Notify when connected to SMTP server
    this.smtpConnection.verify(this.OnConnectedToSmtpServer);
    // Message object
    let message = {
        from: 'Hein <hein@dockermail.drivereu.com>',

        // Comma separated list of recipients
        to: 'Jos <jos@dockermail.drivereu.com>;hein@domain.com',
        bcc: 'hein@dockermail.drivereu.com',

        // Subject of the message
        subject: 'Nodemailer is unicode friendly ✔',

        // plaintext body
        text: 'Hello to myself!',

        // HTML body
        html:
            '<p><b>Hello</b> to myself <img src="cid:note@example.com"/></p>' +
            '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@example.com"/></p>',

        // An array of attachments
        attachments: [
            // String attachment
            {
                filename: 'notes.txt',
                content: 'Some notes about this e-mail',
                contentType: 'text/plain' // optional, would be detected from the filename
            },

            // Binary Buffer attachment
            {
                filename: 'image.png',
                content: Buffer.from(
                    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
                        '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
                        'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
                    'base64'
                ),

                cid: 'note@example.com' // should be as unique as possible
            }
        ]
    } as MailEnvelop;

    let info = await this.smtpConnection.sendMail(message, function (err : any, info : any) {
      if(err)
        console.log(err)
      else
        console.log(info);
   });
    //console.log('Message sent successfully as %s', info.messageId);
}

    // Callback for nodemailer when connected to SMTP server
    private OnConnectedToSmtpServer(error : Error | null, success : boolean) : void {
      if (success) {
        this.logService.LogMessage("Connected to SMTP server");
      } else {
        this.logService.LogErrorMessage(`Failed to connect to SMTP server: ${error ? error : "no error message"}`);
      }
    }


}
