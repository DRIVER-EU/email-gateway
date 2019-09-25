
/*
Service:
- Convert ISimulationEntityPost messages from KAFKA bus to mail server as e-mails
- Convert sent e-mails from mail server to KAFKA bus as ISimulationEntityPost
*/

// Services:
import { IConfigService } from './config-service';
import { ILogService } from './log-service';
import { ITestBedKafkaService } from './test-bed-kafka-service';
import { IPostfixMailServerManagementService } from './postfix-mailserver-management';
import { ISimulationEntityPost, MediumTypes } from './../models/simulation-entity-post';

import { EventEmitter } from 'events';

import { SimEntityPost2MailServerManager } from '../workers/SimEntityPost2MailServerManager';
import { MailServer2SimEntityPostManager } from '../workers/MailServer2SimEntityPostManager';

import { GlobalConst } from './../global-const';

import { testPost } from '../testdata/testdata';

const Fs = require('fs');
const Path = require('path');
const Axios = require('axios');
const Request = require('request');
import Url = require('url');

// https://community.nodemailer.com/


// Configuration settings for this service
export interface ISmtpSettings {
  SmtpHost: string;
  SmtpPort: number;
}

export interface IMapSettings {
  IMapHost: string;
  IMapPort: number;
}


export interface IMailService {
  enqueueSimulationEntityPost(msg: ISimulationEntityPost): void;
  reset(): void;
}

import axios = require('axios');



export class MailService implements IMailService {



  private exportToMailManager: SimEntityPost2MailServerManager;
  private exportToKafkaManager: MailServer2SimEntityPostManager;

  constructor(
    private logService: ILogService,
    private configService: IConfigService,
    private kafkaService: ITestBedKafkaService,
    private postfixService: IPostfixMailServerManagementService) {

    logService.LogMessage(`Start e-mail service`);


    const smtp = configService.SmtpSettings;
    logService.LogMessage(`SMTP connetion parameters ${smtp.SmtpHost}@${smtp.SmtpPort}`);
    const imap = configService.IMapSettings;
    logService.LogMessage(`IMAP connetion parameters ${imap.IMapHost}@${imap.IMapPort}`);

    this.exportToMailManager = new SimEntityPost2MailServerManager(this.logService, this.configService, this.postfixService);
    this.exportToKafkaManager = new MailServer2SimEntityPostManager(this.logService, this.configService, this.postfixService);
    this.kafkaService.on('SimulationEntityPostMsg', msg => this.HandleSimulationEntityPostMsg(msg));
    this.exportToKafkaManager.on('OnPost', post => this.handleKafkaPostMsg(post));
    this.exportToMailManager.start(); // Background task to copy SimEntityPost to the mail server
    this.exportToKafkaManager.start(); // Background task to copy e-mails to SimEntityPost



     this.exportToMailManager.enqueue(testPost);

  }

  private HandleSimulationEntityPostMsg(msg: ISimulationEntityPost) {
    this.enqueueSimulationEntityPost(msg);
  }

  // Received converted mail to ISimulationEntityPost
  private handleKafkaPostMsg(post: ISimulationEntityPost) {
    this.kafkaService.send(post);
  }

  public enqueueSimulationEntityPost(msg: ISimulationEntityPost) {
    if (msg.guid === 'RESET_SCENARIO_REMOVE_ALL') {
      this.logService.LogErrorMessage(`Received CLEAR mailserver command, clear mailsever`);
      this.reset();
    } else if  (msg.owner === GlobalConst.mailOwner) {
        /* prevent handling messages injecten by this service */
    } else if (msg.mediumType === MediumTypes.MAIL) {
        this.exportToMailManager.enqueue(msg); // queue for processing
    } else {
      // This is allowed, since not all messages are mails
    }
  }


   public reset() {
    this.exportToMailManager.reset();
    this.exportToKafkaManager.reset();
    this.postfixService.reset()
      .catch(error => {
        this.logService.LogErrorMessage(`Failed to reset the mailserver (${error}).`);
      });
   }


}
