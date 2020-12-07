import { simpleParser, ParsedMail } from 'mailparser';
import { IPost } from './../models/avro_generated/simulation_entity_post-value';
import { uuid4 } from 'node-test-bed-adapter';
import { uploadFileToLargeFileService } from './../helpers/upload';

import { GlobalConst } from './../global-const';

// Services:
import { IConfigService } from '../services/config-service';
import { ILogService } from '../services/log-service';

const FileSystem = require('fs');
const Util = require('util');
const Path = require('path');

const writeFileAsync = Util.promisify(FileSystem.writeFile);

export class ConvertMailToSimEntity {

    private attachmentUrls:  | { [key: string]: string } | undefined = undefined;
    constructor(private logService: ILogService,
        private configService: IConfigService,
        private mail: ParsedMail) {

    }

    public async GetSimEntityPost(): Promise<IPost> {
        await this.uploadAttachmentsToLargeFileStorage();
        const post: IPost = {
            type: 'MAIL',
            id: this.mail.messageId || uuid4(),
            header: {
                from: (this.mail.from) ? this.mail.from.text : '',
                to: (this.mail.to) ? this.mail.to.value.map(x => x.address) as string[] : undefined,
                subject: this.mail.subject ?? '',
                intro: undefined,
                cc: undefined,
                bcc: undefined,
                date: (this.mail.date) ? (this.mail.date.getTime()) : new Date().getTime(),
                attachments: this.attachmentUrls
            },
            body: this.mail.textAsHtml ?? '',
            timestamp: (this.mail.date) ? (this.mail.date.getTime()) : new Date().getTime(),
            owner: GlobalConst.mailOwner
        };
        return post;
    }

    private async uploadAttachmentsToLargeFileStorage() {
        if (this.mail.attachments) {
            this.attachmentUrls = {};
            for (let i = 0; i < this.mail.attachments.length; i += 1) {
              const attachment = this.mail.attachments[i];
              try {
                  const downloadFolder = this.getDownloadFolder();
                  const filename = new Date().getTime() + ' ' + attachment.filename || '';
                  const downloadFile =  Path.resolve(downloadFolder, filename);
                  await writeFileAsync(downloadFile, attachment.content);
                  const response = await uploadFileToLargeFileService(this.configService.LargFileServiceUrl, downloadFile, true);
                  const responseJson = JSON.parse(response.body);
                  this.logService.LogMessage(`Mail ID '${this.mail.messageId}': attachement ${attachment.filename || '-'} stored under '${responseJson.FileURL}' (${attachment.size} bytes)`);
                  this.attachmentUrls[responseJson.FileURL] = attachment.filename || '';
              } catch (e) {
                  this.logService.LogErrorMessage(`Mail ID '${this.mail.messageId}': Failed to upload attachment to large file service (url ${this.configService.LargFileServiceUrl}), error: ${e} `);
                  this.attachmentUrls[`Failed to publish attachment '${attachment.filename || '-'}' to large file service `] = '.txt';
              }
              // this.logService.LogMessage(attachment.contentType);
              // this.logService.LogMessage(attachment.filename || '');
              // this.logService.LogMessage(attachment.size + '');
              // FileSystem.writeFile(attachment.filename || 'unknown', attachment.content, 'binary', (error: Error) => {
                // console.log('');
              // });

            }
          }
    }

    private getDownloadFolder(): string {
        const downloadFolder = Path.resolve(__dirname, './../../download');
        if (!FileSystem.existsSync(downloadFolder)) {
            FileSystem.mkdirSync(downloadFolder);
        }
        return downloadFolder;
    }
}