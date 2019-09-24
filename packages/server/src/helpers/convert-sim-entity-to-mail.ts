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
            const downloadFolder = this.getUploadFolder();
            for (let attachment in this.mailEntity.files) {
                try {
                    let fileUrl = this.mailEntity.files[attachment];
                    if (validUrl.isUri(fileUrl)) {
                        const filename = new Date().getTime() + ' ' + this.urlToFilename(fileUrl);
                        const file = Path.resolve(downloadFolder, filename);
                        const response = await downloadFile(fileUrl, file);
                        this.attachments.push(this.ConvertFileToAttachementUrl(fileUrl));
                    } else {
                        const uploadFolder = this.getUploadFolder();
                        const filename = new Date().getTime() + '_content ';
                        const downloadFile =  Path.resolve(downloadFolder, filename);
                        await writeFileAsync(downloadFile, fileUrl);
                        const response = await uploadFileToLargeFileService(this.configService.LargFileServiceUrl, downloadFile, true);
                        const responseJson = JSON.parse(response.body);
                        this.attachments.push(this.ConvertFileToAttachementUrl(responseJson.FileURL));
                    }
                } catch (ex) {
                    this.logService.LogErrorMessage('Failed to download' + ex);
                }
            }
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

    private ConvertFileToAttachement(fileName: string, contentBase64: string): Attachment {
        const attachment: Attachment = {
            filename: fileName,
            content: Buffer.from(contentBase64, 'base64'),
            contentType: 'text/plain'
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

    private getUploadFolder(): string {
        const downloadFolder = Path.resolve(__dirname, './../../upload');
        if (!FileSystem.existsSync(downloadFolder)) {
            FileSystem.mkdirSync(downloadFolder);
        }
        return downloadFolder;
    }
}