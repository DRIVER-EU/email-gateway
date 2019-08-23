import { ReadMail } from './../helpers/read-mail';

// Services:
import { IConfigService } from './config-service';
import { ILogService } from './log-service';
import { ITestBedKafkaService } from './test-bed-kafka-service';
import { IPostfixMailServerManagementService } from './postfix-mailserver-management';
import { ISimulationEntityPost, MediumTypes } from './../models/simulation-entity-post';

import * as nodemailer from 'nodemailer';

import { Transporter, Transport, SendMailOptions as MailEnvelop } from 'nodemailer';
import { Options as SmtpOptions } from 'nodemailer/lib/smtp-transport';
import { simpleParser, ParsedMail } from 'mailparser';
import { mailAddressConverter } from './../helpers/mailAdressesConverter';


import { ConvertSimEntityToMail } from './../helpers/convert-sim-entity-to-mail';
import { EventEmitter } from 'events';


// https://community.nodemailer.com/

// Configuration settings for this service
export interface IMailSettings {
  SmtpHost: string;
  SmtpPort: number;
  SmtpUser: string;
  SmtpPassword: string;
}

export interface IMapSettings {
  IMapHost: string;
  IMapPort: number;
}


export interface IMailService {

}

const axios = require('axios');

export interface IMailboxStatus {
  latestUid: number;
}

export class MailService implements IMailService {

  private mailBoxes = new Map<string, IMailboxStatus>();
  private checkingMailboxes: ReadMail[] = [];

  private smtpConnection: Transporter;
  private settings: IMailSettings;


  constructor(
    private logService: ILogService,
    private configService: IConfigService,
    private kafkaService: ITestBedKafkaService,
    private postfixService: IPostfixMailServerManagementService) {
    this.settings = configService.MailSettings;


    // const lst = mailAddressParser();



    this.kafkaService.on('SimulationEntityPostMsg', msg => this.HandleSimulationEntityPostMsg(msg));
    this.InitializeSmtpConnection()
      .then(() => {
        logService.LogMessage('Connected to the mail-sever');
      })
      .catch(err => {
        logService.LogErrorMessage('Failed to connected to the mail-sever');

      });

    this.GetMail('demo@driver.eu');

  }

  rm: ReadMail;
  private GetMail(accountName: string) {
    // var mailBox = this.mailBoxes.get(simItem.guid);
    // if (mailBox) {

    // } else {

    // }
    // this.simulationItems.set( simItem.guid, simItem);


    this.rm = new ReadMail(this.configService.IMapSettings, accountName, 'demo', 1);
    this.rm.on('NewMail', (mail: ParsedMail) => {

      if (mail.attachments) {
        for (let i = 0; i < mail.attachments.length; i += 1) {
          let attachment = mail.attachments[i];
        }
      }
    });
    this.rm.on('Finished', (uid: number) => {
      console.log(uid);
      this.rm.removeAllListeners();
      // this.checkingMailboxes = this.checkingMailboxes.filter(obj => obj !== this.rm);
      delete this.rm;
    });

    this.rm.StartProcessing();
  }


  public async GetAccounts() {
    const result = await this.postfixService.mailAccounts();
    return result;
  }

  private HandleSimulationEntityPostMsg(msg: ISimulationEntityPost) {
    if (msg.mediumType === MediumTypes.MAIL) {
      this.mailSimulationEntityPost(msg);
    }
  }



  private async sendMail(mail: MailEnvelop) {
    try {
      
      if (mail.to)
         this.postfixService.addEMailAddresses(mailAddressConverter(mail.to));
      let info = await this.smtpConnection.sendMail(convertToMail.GetMailMessage(), function (err: any, info: any) {
        if (err)
          console.log(err);
        else
          console.log(info);
      });
    } catch (e) {
      this.logService.LogErrorMessage(`Failed to send message ${msg.guid}`);
    }
  }

  private async mailSimulationEntityPost(msg: ISimulationEntityPost) {

    let convertToMail = new ConvertSimEntityToMail(msg);
    try {
      convertToMail.CheckRequiredFields();
      this.postfixService.addEMailAddresses(convertToMail.ToMailAccounts());
      let info = await this.smtpConnection.sendMail(convertToMail.GetMailMessage(),
         function (err: any, info: any) {
        if (err)
          console.log(err);
        else
          console.log(info);
      });
    } catch (e) {
      this.logService.LogErrorMessage(`Failed to send message ${msg.guid}`);
    }

  }

  async InitializeSmtpConnection() {

    this.logService.LogMessage(`Connecting to SMTP server ${this.settings.SmtpHost} on port ${this.settings.SmtpPort} as user ${this.settings.SmtpUser}`);
    // Create a SMTP transporter object
    const options: SmtpOptions = {
      host: this.settings.SmtpHost,
      port: this.settings.SmtpPort,
      secure: false, // use TLS
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
    };
    this.smtpConnection = nodemailer.createTransport(options);

    // Notify when connected to SMTP server
    this.smtpConnection.verify((e, succes) => this.OnConnectedToSmtpServer(e, succes));



  }

  // Callback for nodemailer when connected to SMTP server
  private OnConnectedToSmtpServer(error: Error | null, success: boolean): void {
    if (success) {
      this.logService.LogMessage('Connected to SMTP server');
    } else {
      const errMessage = error ? error : 'no error message';
      this.logService.LogErrorMessage(`Failed to connect to SMTP server: ${errMessage}`);
    }
  }


}
