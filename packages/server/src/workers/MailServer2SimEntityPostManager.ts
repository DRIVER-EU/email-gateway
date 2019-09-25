// Services:
import { IConfigService } from '../services/config-service';
import { ILogService } from '../services/log-service';
import { IPostfixMailServerManagementService } from '../services/postfix-mailserver-management';
import { ReadMail } from './../helpers/read-mail';
import { simpleParser, ParsedMail } from 'mailparser';
import { MailBoxStatus } from './../helpers/mailBoxStatus';
import { ConvertMailToSimEntity } from './../helpers/convert-mail-to-sim-entity';
import { EventEmitter } from 'events';
import { ISimulationEntityPost, MediumTypes } from './../models/simulation-entity-post';

const FileSystem = require('fs');
const Util = require('util');
const Path = require('path');

const writeFileAsync = Util.promisify(FileSystem.writeFile);

const MailCheckIntervalInSeconds = 60;
const DefaultMailPassword = 'default';

export interface IMailServer2SimEntityPostManager {

    on(event: 'OnPost', listener: (post: ISimulationEntityPost) => void): this;
}

export class MailServer2SimEntityPostManager  extends EventEmitter implements IMailServer2SimEntityPostManager {
    private stop_processing = false;
    private status: MailBoxStatus;

    constructor(private logService: ILogService,
        private configService: IConfigService,
        private postfixService: IPostfixMailServerManagementService) {
            super();
        this.status = new MailBoxStatus(logService);
    }

    
    public reset() {
        this.status.reset();
    }

    public start() {
        this.stop_processing = false;
        this.checkMailBoxes();
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private checkMailBoxes() {
        const checkMailBoxesInBackground = async() => {
          while (!this.stop_processing) {
            const nextTime = new Date().getTime() + (MailCheckIntervalInSeconds * 1000);
            try {
                await this.CheckAllMailBoxes();
            } catch(error) {
                this.logService.LogErrorMessage('Exception when cheking mail boxes ' + error);
            }

            const sleepTime =  nextTime - new Date().getTime();
            if ((sleepTime > 0) && (!this.stop_processing)) {
                this.logService.LogMessage('Finished checking all mailboxes, sleep for ' + sleepTime / 1000 + ' seconds');
                await this.sleep(sleepTime);
            }

          }
        };
        checkMailBoxesInBackground()
            .catch(err => {
                    this.logService.LogErrorMessage('Fatal error in checkMailBoxes processor. ' + err);
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
        this.logService.LogMessage(`Checking ${accounts.length} mailboxes for new send mails` );
        for (let mailAccount in accounts) {
            if (!this.stop_processing) {
                try {
                   await this.checkMailBox(accounts[mailAccount]);
                } catch (ex) {
                    this.logService.LogErrorMessage(`Failed to fetch mail for ${accounts[mailAccount]}: ${ex}`);
                }
            }
        }
    }

    private async checkMailBox(mailAccount: string) {
        if (!mailAccount) return;
        const lastUid = this.status.getUid(mailAccount);
        // this.logService.LogMessage(`Check sent mailbox of user '${mailAccount}'  (uid ${lastUid}:* )`);
        let rm = new ReadMail(this.configService.IMapSettings, mailAccount, DefaultMailPassword, lastUid);
        rm.on('NewMail', async (mail: ParsedMail) => {
            this.logService.LogMessage(`Foward mail from user '${mail.from.text}' send at ${(<Date>mail.date).toISOString()} with id ${mail.messageId} to kafka`);
            try {
                await this.sendMailToKafka(mail);
            } catch(e) {
                this.logService.LogErrorMessage(e);
            }

        });
        await rm.FetchMails();
        // this.logService.LogMessage(`Mailbox of ${mailAccount} checked.`);
        rm.removeAllListeners();
        const highestUid = rm.getHighestUid();
        if (lastUid !== highestUid) {
            this.logService.LogMessage(`User '${mailAccount}' mail send to kafka, update uid to ${highestUid}. `);
            this.status.update(mailAccount, rm.getHighestUid());
            this.status.save();
        }
    }

    private async sendMailToKafka(mail: ParsedMail) {
//          if (mail.html !== false) this.logService.LogMessage(<string>mail.html);
//        this.logService.LogMessage(mail.text);
         const convertMail = new ConvertMailToSimEntity(this.logService, this.configService, mail);
         const post = await convertMail.GetSimEntityPost();
         this.emit('OnPost', post);
    }
}