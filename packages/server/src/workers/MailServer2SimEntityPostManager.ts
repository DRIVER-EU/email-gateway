// Services:
import { IConfigService } from "../services/config-service.js";
import { ILogService } from "../services/log-service.js";
import { IPostfixMailServerManagementService } from "../services/postfix-mailserver-management.js";
import { ReadMail } from "../helpers/read-mail.js";
import { ParsedMail } from "mailparser";
import { MailBoxStatus } from "../helpers/mailBoxStatus.js";
import { ConvertMailToSimEntity } from "../helpers/convert-mail-to-sim-entity.js";
import { EventEmitter } from "events";
import { IPost } from "../models/avro_generated/simulation_entity_post-value.js";
import util from "util";
import { writeFile } from "node:fs";

const writeFileAsync = util.promisify(writeFile);

export interface IMailServer2SimEntityPostManager {
  on(event: "OnPost", listener: (post: IPost) => void): this;
}

export class MailServer2SimEntityPostManager
  extends EventEmitter
  implements IMailServer2SimEntityPostManager
{
  private stop_processing = false;
  private MailCheckIntervalInSeconds: number = 60;
  private DefaultMailPassword = "default";
  private status: MailBoxStatus;

  constructor(
    private logService: ILogService,
    private configService: IConfigService,
    private postfixService: IPostfixMailServerManagementService
  ) {
    super();
    this.status = new MailBoxStatus(logService);
    this.MailCheckIntervalInSeconds = configService.MailCheckIntervalInSeconds;
    this.DefaultMailPassword = configService.DefaultMailPassword;
  }

  public reset() {
    this.status.reset();
  }

  public start() {
    this.stop_processing = false;
    this.checkMailBoxes();
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private checkMailBoxes() {
    const checkMailBoxesInBackground = async () => {
      while (!this.stop_processing) {
        const nextTime =
          new Date().getTime() + this.MailCheckIntervalInSeconds * 1000;
        const startTime = new Date().getTime();
        try {
          await this.CheckAllMailBoxes();
        } catch (error: any) {
          this.logService.LogErrorMessage(
            `Exception when checking mail boxes. Status ${error.status}, ${error.statusText} when accessing ${error.url}.`
          );
        }

        const sleepTime = nextTime - new Date().getTime();
        if (sleepTime > 0 && !this.stop_processing) {
          const ellapsedTimeMs = Math.round(
            (new Date().getTime() - startTime) / 1000
          );
          this.logService.LogMessage(
            `Finished checking all outgoing mailboxes (${ellapsedTimeMs} sec.), sleep for ${Math.round(
              sleepTime / 1000
            )} sec.`
          );
          await this.sleep(sleepTime);
        }
      }
    };
    checkMailBoxesInBackground().catch((err) => {
      this.logService.LogErrorMessage(
        "Fatal error in checkMailBoxes processor. " + err
      );
    });
  }

  private async CheckAllMailBoxes() {
    const accounts = await this.postfixService.mailAccounts();
    /* let rm = new ReadMail(this.configService.IMapSettings, 'hein@demo.com', DefaultMailPassword);
        try {
            rm.on('NewMail', (mail: ParsedMail) => {
                console.log();
            });
            await rm.FetchMails();
            rm.removeAllListeners();
        } catch(e) {
            console.log('error');
        }
        console.log('finished'); */
    this.logService.LogMessage(
      `Checking ${accounts.length} mailboxes for outgoing mails`
    );
    for (let mailAccount in accounts) {
      if (!this.stop_processing) {
        try {
          await this.checkMailBox(accounts[mailAccount]);
        } catch (ex) {
          this.logService.LogErrorMessage(
            `Failed to fetch mail for ${accounts[mailAccount]}: ${ex}`
          );
        }
      }
    }
  }

  private async checkMailBox(mailAccount: string) {
    if (!mailAccount) return;
    const lastUid = this.status.getUid(mailAccount);
    // this.logService.LogMessage(`Check sent mailbox of user '${mailAccount}'  (uid ${lastUid}:* )`);
    let rm = new ReadMail(
      this.configService.IMapSettings,
      mailAccount,
      this.DefaultMailPassword,
      lastUid
    );
    rm.on("NewMail", async (mail: ParsedMail) => {
      this.logService.LogMessage(
        `Foward mail from user '${mail.from ? mail.from.text : ""}' send at ${(
          mail.date as Date
        ).toISOString()} with id ${mail.messageId} to kafka`
      );
      try {
        await this.sendMailToKafka(mail);
      } catch (ex) {
        this.logService.LogErrorMessage(`${ex}`);
      }
    });
    await rm.FetchMails();
    // this.logService.LogMessage(`Mailbox of ${mailAccount} checked.`);
    rm.removeAllListeners();
    const highestUid = rm.getHighestUid();
    if (lastUid !== highestUid) {
      this.logService.LogMessage(
        `User '${mailAccount}' mail send to kafka, update uid to ${highestUid}. `
      );
      this.status.update(mailAccount, rm.getHighestUid());
      this.status.save();
    }
  }

  private async sendMailToKafka(mail: ParsedMail) {
    //          if (mail.html !== false) this.logService.LogMessage(<string>mail.html);
    //        this.logService.LogMessage(mail.text);
    const convertMail = new ConvertMailToSimEntity(
      this.logService,
      this.configService,
      mail
    );
    const post = await convertMail.GetSimEntityPost();
    this.emit("OnPost", post);
  }
}
