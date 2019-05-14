import { ReadMail } from './../helpers/read-mail';


// Services:
import { IConfigService } from './config-service';
import { ILogService } from './log-service';
import { ITestBedKafkaService } from './test-bed-kafka-service'
import { ISimulationEntityPost, MediumTypes } from './../models/simulation-entity-post'

import * as nodemailer from "nodemailer";

import { Transporter, Transport, SendMailOptions as MailEnvelop } from 'nodemailer';
import { Options as SmtpOptions } from 'nodemailer/lib/smtp-transport'



import { MailManagementApi, Configuration, MailAccountsResult } from './../generated_rest_api/index';
import { MAILSERVER_BASE_PATH } from './../config';
import { ConvertSimEntityToMail } from './../helpers/convert-sim-entity-to-mail';



// https://community.nodemailer.com/

// Configuration settings for this service
export interface IMailSettings {
  SmtpHost: string;
  SmtpPort: number;
  SmtpUser: string;
  SmtpPassword: string;
}

export interface IMailService {

}
const axios = require('axios');

export class MailService implements IMailService {

  private smtpConnection: Transporter;
  private settings: IMailSettings;
  private restClient: MailManagementApi;

  constructor(
    private logService: ILogService,
    private configService: IConfigService,
    private kafkaService: ITestBedKafkaService) {
    this.settings = configService.MailSettings;
    

    //const lst = mailAddressParser();

    const url = MAILSERVER_BASE_PATH;
    this.restClient = new MailManagementApi(undefined, url, undefined);
   
    this.kafkaService.on("SimulationEntityPostMsg", msg => this.HandleSimulationEntityPostMsg(msg));
    this.InitializeSmtpConnection()
      .then(() => {
        logService.LogMessage("Connected to the mail-sever");
      })
      .catch(err => {
        logService.LogErrorMessage("Failed to connected to the mail-sever");

      });

this.GetMail();

  }


  private GetMail() {
    const rm = new ReadMail();
    rm.ReadMail();

  }


  public async GetAccounts() {
    const result = await this.restClient.mailAccounts();
    console.log(result);
    return result;
  }

  private HandleSimulationEntityPostMsg(msg: ISimulationEntityPost) {
    if (msg.mediumType === MediumTypes.MAIL) {
      this.mailSimulationEntityPost(msg);
    }
  }


  private async mailSimulationEntityPost(msg: ISimulationEntityPost) {

    let convertToMail = new ConvertSimEntityToMail(msg);
    try {
      convertToMail.CheckRequiredFields();
      const mailAccounts = await this.restClient.mailAccounts();
      
      convertToMail.ToMailAccounts().forEach(mailAddress =>
        {
          if (!mailAccounts.Accounts.includes(mailAddress)) {
            this.logService.LogMessage(`Add mail account ${mailAddress} to mailserver`);
            this.restClient.addAccount(mailAddress, "default");
          }
        });
      let info = await this.smtpConnection.sendMail(convertToMail.GetMailMessage(), function (err: any, info: any) {
        if (err)
          console.log(err)
        else
          console.log(info);
      });
    } catch(e) 
    {
      this.logService.LogErrorMessage(`Failed to send message ${msg.guid}`);
    }

  }

  async InitializeSmtpConnection() {

    this.logService.LogMessage(`Connecting to SMTP server ${this.settings.SmtpHost} on port ${this.settings.SmtpPort} as user ${this.settings.SmtpUser}`);
    // Create a SMTP transporter object
    const options: SmtpOptions = {
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
    };
    this.smtpConnection = nodemailer.createTransport(options);

    // Notify when connected to SMTP server
    this.smtpConnection.verify((e, succes) => this.OnConnectedToSmtpServer(e, succes));



  }

  // Callback for nodemailer when connected to SMTP server
  private OnConnectedToSmtpServer(error: Error | null, success: boolean): void {
    if (success) {
      this.logService.LogMessage("Connected to SMTP server");
    } else {
      const errMessage = error ? error : "no error message";
      this.logService.LogErrorMessage(`Failed to connect to SMTP server: ${errMessage}`);
    }
  }


}
