// Convert SimItem message to e-mail and send to e-mail server
import { Queue } from "../helpers/queue_helper.js";
// NodeMailer
import nodemailer from "nodemailer";
import { SendMailOptions as MailEnvelop } from "nodemailer";
import {
  Options as SmtpOptions,
  SentMessageInfo,
} from "nodemailer/lib/smtp-transport";
// Services:
import { IConfigService } from "../services/config-service.js";
import { ILogService } from "../services/log-service.js";
import { IPostfixMailServerManagementService } from "../services/postfix-mailserver-management.js";
import { ConvertSimEntityToMail } from "../helpers/convert-sim-entity-to-mail.js";
import { IPost } from "../models/avro_generated/simulation_entity_post-value.js";
import { GlobalConst } from "../global-const.js";
// Convert mail address
import {
  mailAddressConverterSingleToString,
  mailAddressConverterToString,
} from "../helpers/mailAdressesConverter.js";

const maxQueueSize = 200;

export class SimEntityPost2MailServerManager {
  private queue = new Queue<IPost>();
  private stop_processing = false;

  constructor(
    private logService: ILogService,
    private configService: IConfigService,
    private postfixService: IPostfixMailServerManagementService
  ) {}

  public reset() {
    // Do nothing
  }

  public start() {
    this.stop_processing = false;
    this.handleSimulationEntityPosts();
  }

  public stop() {
    this.stop_processing = true;
  }

  public enqueue(post: IPost) {
    if (this.queue.count < maxQueueSize) {
      this.queue.enqueue(post);
    } else
      this.logService.LogErrorMessage(
        "SimulationEnityPost queue overflow, drop post."
      );
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleSimulationEntityPosts() {
    const handleMessageQueueInBackground = async () => {
      while (!this.stop_processing) {
        if (this.queue.count > 0) {
          const item = this.queue.dequeue();
          if (item) {
            await this.publishPostToMailServer(item);
          } else {
            this.logService.LogErrorMessage("This should never happen?!");
          }
        }
        if (this.queue.count === 0) await this.sleep(3000);
      }
    };
    handleMessageQueueInBackground()
      .catch((error) =>
        this.logService.LogErrorMessage(
          `Fatal error in processing queue SimulationEntityPost ${error}`
        )
      )
      .finally(() =>
        this.logService.LogErrorMessage(
          `Stop processing queue SimulationEntityPost`
        )
      );
  }

  private async publishPostToMailServer(post: IPost) {
    try {
      this.logService.LogMessage(
        `Start publishing post '${post.id}' to mail server.`
      );
      // Convert ISimulationEntityPost to NodeMailer object
      let convertToMail = new ConvertSimEntityToMail(
        this.logService,
        this.configService,
        post
      );
      const mailMessage: MailEnvelop = await convertToMail.GetMailMessage();
      const dt =
        Object.prototype.toString.call(mailMessage.date) === "[object Date]"
          ? (mailMessage.date as Date).toISOString()
          : mailMessage.date;
      this.logService.LogMessage(
        `Converted post ${
          post.id
        } to mail ==> From: '${mailAddressConverterSingleToString(
          mailMessage.from
        )}' To: '${mailAddressConverterToString(
          mailMessage.to
        )}' cc: '${mailAddressConverterToString(
          mailMessage.cc
        )}' bcc: '${mailAddressConverterToString(
          mailMessage.bcc
        )}' Date: '${dt}' Subject: '${mailMessage.subject}'`
      );
      // Create mail accounts on mail-server if don't exsist.
      const mailaccounts = [
        ...convertToMail.FromMailAccount(),
        ...convertToMail.ToMailAccounts(),
        ...convertToMail.CcMailAccounts(),
        ...convertToMail.BccMailAccounts(),
      ];
      await this.postfixService.addEMailAddressesAdv(mailaccounts);
      await this.sleep(2500); // Give server time to create account
      const from = convertToMail.FromMailAccount()[0];
      let smtpClient = nodemailer.createTransport(
        this.connectConfiguration(from.address, GlobalConst.defaultMailPassword)
      );
      if (await smtpClient.verify()) {
        // Validate account
        // The attachments are automatically handled by node mailer.
        const response: SentMessageInfo = await smtpClient.sendMail(
          mailMessage
        );
        this.logService.LogMessage(
          `Published post ${post.id} to mail server with id ${response.messageId}.`
        );
      } else {
        this.logService.LogErrorMessage(
          `Failed to connect to IMAP server to publish post ${post.id}.`
        );
      }
    } catch (e) {
      this.logService.LogErrorMessage(
        `Failed to send message ${post.id}: ${e}`
      );
    }
  }

  private connectConfiguration(username: string, password: string) {
    const options: SmtpOptions = {
      host: this.configService.SmtpSettings.SmtpHost,
      port: this.configService.SmtpSettings.SmtpPort,
      secure: false, // use TLS
      requireTLS: true,
      auth: {
        user: username,
        pass: password,
      },
      logger: true,
      debug: false,
      tls: {
        //   do not fail on invalid certs
        rejectUnauthorized: false,
      },
    };
    return options;
  }
}
