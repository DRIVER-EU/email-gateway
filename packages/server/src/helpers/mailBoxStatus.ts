import { ILogService } from '../services/log-service';

const FileSystem = require('fs');
const Util = require('util');
const Path = require('path');
const OS = require('os');

export interface IMailboxStatus {
    latestUid: number;
}

export class MailBoxStatus  {
    private mailBoxes = new Map<string, IMailboxStatus>();

    constructor(private logService: ILogService) {
        this.loadMailBoxStatus();
    }

    public save() {
        let writeStatus = FileSystem.createWriteStream(this.getMailStatusFile());
        const endOfLine = OS.EOL;
        for (let [k, v] of this.mailBoxes) {
            writeStatus.write(`${k}|${v.latestUid}\n`);
        }
        writeStatus.end();
        // FileSystem.writeFileSync(this.getMailStatusFile(), JSON.stringify(this.mailBoxes, null, 2) , 'utf-8');
    }

    public update(mailaccount: string, uuid: number) {
        this.mailBoxes.set(mailaccount, { latestUid: uuid});
    }

    // Prevent mails from being sent twice, remember last mail send (uid) to kafka
    public loadMailBoxStatus() {
        const filename = this.getMailStatusFile();
        this. mailBoxes = new Map<string, IMailboxStatus>();
        this.logService.LogMessage(`Load mail status from file ${filename}`);
        const lines = require('fs').readFileSync(filename, 'utf-8').split('\n').filter(Boolean);
        for(let line in lines) {
           const fields = lines[line].split('|');
           if (fields.length === 2) {
               const mailAccount = fields[0];
               const lastUid =  parseInt(fields[1]);
               this.logService.LogMessage(`* ${mailAccount}: UID ${lastUid}`);
               this.mailBoxes.set(mailAccount, { latestUid: lastUid});
           }
        }
    }

    private getMailStatusFile(): string {
        const statusFolder = Path.resolve(__dirname, './../../status');
        if (!FileSystem.existsSync(statusFolder)) {
            FileSystem.mkdirSync(statusFolder);
        }
        const filename = 'mailboxes.json';
        const statusFile =  Path.resolve(statusFolder, filename);
        return statusFile;
    }

    public getUid(mailAccount: string): number {
        let dta = this.mailBoxes.get(mailAccount);
        if (dta) {
            return dta.latestUid;
        }
        const entry = { latestUid: 0 };
        this.mailBoxes.set(mailAccount, entry);
        return entry.latestUid;
    }
}