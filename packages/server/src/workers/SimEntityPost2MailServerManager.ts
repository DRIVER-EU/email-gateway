// Convert SimItem message to e-mail and send to e-mail server

import { Queue } from '../helpers/queue_helper';

// NodeMailer
import * as nodemailer from 'nodemailer';
import { Transporter, Transport, SendMailOptions as MailEnvelop } from 'nodemailer';
import { Options as SmtpOptions, SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { simpleParser, ParsedMail } from 'mailparser';


// Services:
import { IConfigService } from '../services/config-service';
import { ILogService } from '../services/log-service';
import { IPostfixMailServerManagementService } from '../services/postfix-mailserver-management';

import { ConvertSimEntityToMail } from '../helpers/convert-sim-entity-to-mail';

import { ISimulationEntityPost, MediumTypes } from '../models/simulation-entity-post';
import { GlobalConst } from './../global-const';

const maxQueueSize = 200;

export class SimEntityPost2MailServerManager {
    private queue = new Queue<ISimulationEntityPost>();
    private stop_processing = false;

    constructor(private logService: ILogService,
        private configService: IConfigService,
        private postfixService: IPostfixMailServerManagementService) {

    }

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

    public enqueue(post: ISimulationEntityPost) {
        if (this.queue.count < maxQueueSize) {
            this.queue.enqueue(post);
        } else this.logService.LogErrorMessage('SimulationEnityPost queue overflow, drop post.');
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private handleSimulationEntityPosts() {
        const handleMessageQueueInBackground = async() => {
          while (!this.stop_processing) {
              if (this.queue.count > 0) {
                  const item = this.queue.dequeue();
                  if (item) {
                      await this.publishPostToMailServer(item);
                  } else {
                    this.logService.LogErrorMessage('This should never happen?!');
                  }
              }
              if (this.queue.count === 0) await this.sleep(3000);
          }
        };
        handleMessageQueueInBackground()
            .catch(error => this.logService.LogErrorMessage(`Fatal error in processing queue SimulationEntityPost ${error}`))
            .finally(() => this.logService.LogErrorMessage(`Stop processing queue SimulationEntityPost`));
    }

    private async publishPostToMailServer(post: ISimulationEntityPost) {
        try {
            this.logService.LogMessage(`Start publishing post '${post.guid}' to mail server.`);
            // Convert ISimulationEntityPost to NodeMailer object
            let convertToMail = new ConvertSimEntityToMail(this.logService, this.configService, post);
            const mailMessage: MailEnvelop = await convertToMail.GetMailMessage();
             // Create mail account in from and to on mail-server if don't exsist.
             await this.postfixService.addEMailAddressesAdv(convertToMail.FromMailAccount());
             await this.postfixService.addEMailAddressesAdv(convertToMail.ToMailAccounts());
             const from = convertToMail.FromMailAccount()[0];
             let smtpClient = nodemailer.createTransport(this.connectConfiguration(from.address, GlobalConst.defaultMailPassword));
             if (await smtpClient.verify()) { // Validate account
                // The attachments are automatically handled by node mailer.
                const response: SentMessageInfo = await smtpClient.sendMail(mailMessage);
                this.logService.LogMessage(`Published post ${post.guid} to mail server with id ${response.messageId}.`);
             } else {
                 this.logService.LogErrorMessage(`Failed to connect to IMAP server to publish post ${post.guid}.`);
             }

        } catch (e) {
          this.logService.LogErrorMessage(`Failed to send message ${post.guid}: ${e}`);
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
          pass: password
        },
        logger: true,
        debug: false,
        tls: {
          //   do not fail on invalid certs
          rejectUnauthorized: false
        }
      };
      return options;
    }
}