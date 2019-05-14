import { ISimulationEntityPost } from './../models/simulation-entity-post';
import { SendMailOptions as MailEnvelop } from 'nodemailer';
import { Attachment } from "nodemailer/lib/mailer";
import mailAddressesParser = require("nodemailer/lib/addressparser");

export class ConvertSimEntityToMail {

    constructor(private mailEntity: ISimulationEntityPost) {

    }

    public CheckRequiredFields() {
        if (!this.mailEntity.senderName || this.mailEntity.senderName.length === 0)
            throw new Error('No from-field set in ISimulationEntityPost');
        if (!this.mailEntity.recipients || this.mailEntity.recipients.length === 0)
            throw new Error('No to-field set in ISimulationEntityPost');
    }

    public GetMailMessage(): MailEnvelop {
        let message = {
            headers: {
                'x-gateway-key': 'from kafka',
               
            },
            from: this.mailEntity.senderName,

            // Comma separated list of recipients
            to: this.mailEntity.recipients,
            bcc: undefined,

            // Subject of the message
            subject: this.mailEntity.body,

            // plaintext body
            text: this.mailEntity.body,

            // HTML body
            html:"",

            // An array of attachments
            attachments: this.GetAttachments()
        } as MailEnvelop;
        return message;
    }

    private GetAttachments(): Attachment[] | null {
        if (this.mailEntity.files) {
            let attachments: Attachment[] = new Array();
            let index = 0;
            this.mailEntity.files.forEach(attachmentFile => {
                attachments.push(this.ConvertFileToAttachement(`Attachment_${index}.txt`, attachmentFile));
                index++;
            });
            return attachments;
        }
        return null;

    }

    private ConvertFileToAttachement(fileName: string, contentBase64: string): Attachment {
        const attachment: Attachment = {
            filename: fileName,
            content: Buffer.from(contentBase64,'base64'),
            contentType: 'text/plain'
        }
        return attachment;
    }

    public ToMailAccounts() : string[]
    {
        let mailAddresses : string[] = [];
        if (this.mailEntity.recipients)
           this.mailEntity.recipients.forEach(item => mailAddressesParser(item).forEach(mailAddress => mailAddresses.push(mailAddress.address)));
        return mailAddresses;
    }
}