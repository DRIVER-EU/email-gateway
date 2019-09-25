// Convert ISimulationEntityPost to MailEnvelop (used by NodeMailer)

import { ISimulationEntityPost, MediumTypes } from './../models/simulation-entity-post';
import { SendMailOptions as MailEnvelop } from 'nodemailer';
import { Address, Attachment } from 'nodemailer/lib/mailer';

import { downloadFile } from './../helpers/download';
import { mailAddressConverter, mailAddressConverterSingle } from './../helpers/mailAdressesConverter';

import Url = require('url');
import { uuid4 } from 'node-test-bed-adapter';

// Services:
import { IConfigService } from '../services/config-service';
import { ILogService } from '../services/log-service';

import { uploadFileToLargeFileService } from './../helpers/upload';

const validUrl = require('valid-url');
const FileSystem = require('fs');
const Util = require('util');
const Path = require('path');
const btoa = require('btoa');

const writeFileAsync = Util.promisify(FileSystem.writeFile);

export class ConvertSimEntityToMail {

    private attachments: Attachment[] = new Array();

    constructor(private logService: ILogService,
        private configService: IConfigService, private mailEntity: ISimulationEntityPost) {

    }

    private validateThrowIfInvalid() {
        if (this.mailEntity.mediumType !== MediumTypes.MAIL)
            throw new Error('No mail type set in ISimulationEntityPost');
        if (!this.mailEntity.senderName || this.mailEntity.senderName.length === 0)
            throw new Error('No from-field set in ISimulationEntityPost');
        if (!this.mailEntity.recipients || this.mailEntity.recipients.length === 0)
            throw new Error('No to-field set in ISimulationEntityPost');
        // if ((this.mailEntity.files) && this.mailEntity.files.some(x => !validUrl.isUri(x)))
        //    throw new Error('Not all files are valid URLs in ISimulationEntityPost');
    }

    // The nodemailer also download the file, used to check if attachment is aval (or else nodemailer throws error)
    public async downloadAttachments() {
        if ((this.mailEntity.files)) {
            const downloadFolder = this.getDownloadFolder();
            for (let attachment in this.mailEntity.files) {
                try {
                    let content = this.mailEntity.files[attachment];
                    if (validUrl.isUri(content)) {
                        const name = this.urlToFilename(content);
                        const filename = new Date().getTime() + '_' + name;
                        const file = Path.resolve(downloadFolder, filename);
                        try {
                           const response = await downloadFile(content, file);
                           this.logService.LogMessage(`Mail '${this.mailEntity.guid}': downloaded attachment (location: ${file}) `);
                           // // Use this if nodemailer must download file, nodemailer will fail is attachment is not downloadable: this.attachments.push(this.ConvertFileToAttachementUrl(content));
                           const attachment = this.createFileAttachement(filename, name);
                           this.attachments.push(attachment);
                        } catch (downloadError) {
                            this.logService.LogErrorMessage(`Mail '${this.mailEntity.guid}': failed to downloaded attachment ${content} `);
                            const attachment = this.createTextAttachement(`Error_${new Date().getTime()}.txt`, `Failed to download ${content}.`);
                            this.attachments.push(attachment);
                        }
                    } else {
                        try {
                            const base64Content = this.isBase64(content) ? content : btoa(content);
                            const filename = new Date().getTime() + '_content ';
                            const fullFileName =  Path.resolve(downloadFolder, filename);
                            await writeFileAsync(fullFileName, base64Content, 'base64');
                            this.logService.LogMessage(`Mail '${this.mailEntity.guid}': saved attachment (location: ${fullFileName}) `);
                            this.attachments.push(this.createFileAttachement(fullFileName, filename));
                            // Place in large file storage (not  needed)
                            // try {
                            //   const response = await uploadFileToLargeFileService(this.configService.LargFileServiceUrl, saveFile, true);
                            //   const responseJson = JSON.parse(response.body);
                            //   this.attachments.push(this.createUrlAttachement(responseJson.FileURL, filename));
                            // } catch(e) {
                            // }
                        } catch (error) {
                            this.logService.LogErrorMessage(`Mail '${this.mailEntity.guid}': failed to save attachment `);
                            const attachment = this.createTextAttachement(`Error_${new Date().getTime()}.txt`, `Failed to save content`);
                        }
                    }
                } catch (ex) {
                    this.logService.LogErrorMessage('Failed to download' + ex);
                }
            }
        }
    }

    private isBase64(content: string): boolean {
        if (content === '' || content.trim() === '') { return false; }
        try {
            return btoa(atob(content)) === content;
        } catch (err) {
            return false;
        }
    }

    public async GetMailMessage(): Promise<MailEnvelop> {
        this.validateThrowIfInvalid();
        await this.downloadAttachments();
        let message = {
            headers: {
                'x-gateway-key': 'KAFKA',
            },
            from: this.FromMailAccount()[0],

            // Comma separated list of recipients
            to: this.ToMailAccounts(),
            bcc: undefined,

            // Subject of the message
            subject: this.Subject(),

            // plaintext body
            text: '',

            // HTML body
            html: this.Body(),

            date: this.Timestamp(),

            // An array of attachments
            attachments: this.GetAttachments()
        } as MailEnvelop;
        return message;
    }
    private GetAttachments(): Attachment[] | null {
        return this.attachments;
    }

    // https://community.nodemailer.com/using-attachments/
    // Assume that all attachements are url to large file service.
    private ConvertFileToAttachementUrl(url: string): Attachment {
        // https://nodejs.org/api/url.html
        const filename = this.urlToFilename(url);
        const attachment: Attachment = {
            filename: filename,
            path: url
        };
        return attachment;
    }

    private urlToFilename(url: string): string {
        const result = Url.parse(url);
        const pathname = result.pathname || '/' + uuid4();
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        return filename;
    }

    private createUrlAttachement(url: string, name: string) {
        const attachment: Attachment = {
            filename: name,
            path: url
        };
        return attachment;
    }

    private createFileAttachement(filename: string, name: string) {
        const attachment: Attachment = {
            filename: name,
            path: filename
        };
        return attachment;
    }

    private createTextAttachement(name: string, content: string): Attachment {
        const attachment: Attachment = {
            filename: name,
            content: Buffer.from(btoa(content), 'base64'),
            contentType: 'text/plain',
            encoding: 'base64'
        };
        return attachment;
    }


    public FromMailAccount() {
        return mailAddressConverter(this.mailEntity.senderName);
    }

    public ToMailAccounts(): Address[] {
        return (this.mailEntity.recipients) ? mailAddressConverter(this.mailEntity.recipients) : [];
    }

    public Subject() {
        return this.mailEntity.name;
    }

    public Body() {
        return this.mailEntity.body;
    }

    public Timestamp(): Date {
        let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(this.mailEntity.date);
        return d;
    }

    private getDownloadFolder(): string {
        const downloadFolder = Path.resolve(__dirname, './../../download');
        if (!FileSystem.existsSync(downloadFolder)) {
            FileSystem.mkdirSync(downloadFolder);
        }
        return downloadFolder;
    }
}