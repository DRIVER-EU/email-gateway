/*
Service:
- Convert ISimulationEntityPost messages from KAFKA bus to mail server as e-mails
- Convert sent e-mails from mail server to KAFKA bus as ISimulationEntityPost
*/

// Services:
import { IConfigService } from "./config-service.js";
import { ILogService } from "./log-service.js";
import { ITestBedKafkaService } from "./test-bed-kafka-service.js";
import { IPostfixMailServerManagementService } from "./postfix-mailserver-management.js";
import { IPost } from "../models/avro_generated/simulation_entity_post-value.js";
import { SimEntityPost2MailServerManager } from "../workers/SimEntityPost2MailServerManager.js";
import { MailServer2SimEntityPostManager } from "../workers/MailServer2SimEntityPostManager.js";
import { GlobalConst } from "../global-const.js";

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
  enqueueSimulationEntityPost(msg: IPost): void;
  reset(): void;
  start(): void;
}

export class MailService implements IMailService {
  private exportToMailManager: SimEntityPost2MailServerManager;
  private exportToKafkaManager: MailServer2SimEntityPostManager;

  constructor(
    private logService: ILogService,
    private configService: IConfigService,
    private kafkaService: ITestBedKafkaService,
    private postfixService: IPostfixMailServerManagementService
  ) {
    logService.LogMessage(`Start e-mail service`);

    const smtp = configService.SmtpSettings;
    logService.LogMessage(
      `SMTP connetion parameters ${smtp.SmtpHost}@${smtp.SmtpPort}`
    );
    const imap = configService.IMapSettings;
    logService.LogMessage(
      `IMAP connetion parameters ${imap.IMapHost}@${imap.IMapPort}`
    );

    this.exportToMailManager = new SimEntityPost2MailServerManager(
      this.logService,
      this.configService,
      this.postfixService
    );
    this.exportToKafkaManager = new MailServer2SimEntityPostManager(
      this.logService,
      this.configService,
      this.postfixService
    );
    this.kafkaService.on("SimulationEntityPostMsg", (msg) =>
      this.HandleSimulationEntityPostMsg(msg)
    );
    this.exportToKafkaManager.on("OnPost", (post) =>
      this.handleConvertedMailToSimulationEntityPost(post)
    );

    // this.exportToMailManager.enqueue(testPost);
  }

  public start() {
    this.logService.LogMessage(`Starting export to mailserver and kafka`);
    this.exportToMailManager.start(); // Background task to copy SimEntityPost to the mail server
    this.exportToKafkaManager.start(); // Background task to copy e-mails to SimEntityPost
  }

  private HandleSimulationEntityPostMsg(msg: IPost) {
    if (!msg) return;
    this.logService.LogMessage(
      `Place SimulationEntityPost ${msg.id || "-"} in processing queue`
    );
    this.enqueueSimulationEntityPost(msg);
  }

  // Received converted mail to ISimulationEntityPost
  private handleConvertedMailToSimulationEntityPost(post: IPost) {
    this.kafkaService.sendSimulationEntityPostToKafka(post);
  }

  public enqueueSimulationEntityPost(msg: IPost) {
    if (msg.id === "RESET_SCENARIO_REMOVE_ALL") {
      this.logService.LogErrorMessage(
        `Received CLEAR mailserver command, clear mailsever`
      );
      this.reset();
    } else if (msg.owner === GlobalConst.mailOwner) {
      /* prevent handling messages injecten by this service */
    } else if (msg.type?.toLocaleLowerCase() === "mail") {
      this.exportToMailManager.enqueue(msg); // queue for processing
      this.logService.LogMessage(
        `Received KAFKA 'SimulationEntityPost' message, start processing: ${JSON.stringify(
          msg,
          null,
          3
        )}`
      );
    } else {
      // This is allowed, since not all messages are mails
    }
  }

  public reset() {
    this.exportToMailManager.reset();
    this.exportToKafkaManager.reset();
    this.postfixService.reset().catch((error) => {
      this.logService.LogErrorMessage(
        `Failed to reset the mailserver (${error}).`
      );
    });
  }
}
