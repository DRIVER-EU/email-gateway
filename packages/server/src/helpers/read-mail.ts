// https://github.com/sahat/Nodemailer

import { Attachment } from 'nodemailer/lib/mailer';
import { simpleParser, ParsedMail } from "mailparser";
import { SendMailOptions as MailEnvelop, } from 'nodemailer';
import { Box as MailBox, ImapMessage, ImapMessageAttributes, Config as ImapConfig } from "imap";
import imapConnection = require("imap");
/*
In mail message:
- Sequence number: The oldest message has seq. number 1. The seq. numbers are increased with one. When a mail is 
                   delete the seq. numbers are consecutively (the purse imap event is triggerd when this happens). 
                   --> The seq. number of a mail message can change over time! <--
- Uid number:      The oldest message has uid 1.The uid numbers are increased with one. A uid number will never change!
- Mail identifier: Unique string that identifies the mail

When searching for latest uid (so e.g. 5:*) it will return all id's. Important: when there NO mail that match the criteria
the latest mail is returned! 

*/

export class ReadMail {

    private connection: imapConnection;
    private uidLatest: number;
    constructor(latestMailUid: number = 0) {
        this.uidLatest = latestMailUid;
        const cfg: ImapConfig = {
            user: 'account@b.com',
            password: 'default',
            host: 'localhost',
            port: 993,
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false
            }
        };
        this.connection = new imapConnection(cfg);
        this.connection.once("error", this.ImapConnectionError);
        this.connection.once("end", this.ImapConnectionClosed);
        // Once the mail box ready
        this.connection.once("ready", () => {
            // Open the INBOX
            this.connection.openBox("INBOX", false /* readonly */, (err: Error, box: MailBox) => {
                if (err) {
                    console.log(err);
                } else {

                    try {
                        // Search for new mails (Mails where UID is greater then latest UID)
                        // If the search should return Seq Number use: this.connection.seq.search
                        const search: string = (this.uidLatest === 0) ? "1:*" /* all mails */ : `{this.latestMailUid+1}:*`;
                        this.connection.search([["UID", search]], (err1: Error, uidNumbers: number[] /* UID numbers */) => {
                            if ((!uidNumbers) ||
                                (uidNumbers.length === 1) && (uidNumbers[0] === this.uidLatest)) {
                                // No new mails found!
                            } else {
                                // Fetch the mail content of the found UIDs
                                // Use this.connection.seq.fetch to fetch mail by seq number
                                let fetchRequest = this.connection.fetch(uidNumbers, {
                                    bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)',
                                    struct: true
                                });
                                // Handle all the mails from fetch command
                                fetchRequest.on("message", (msg: ImapMessage, seqno: number) => {
                                    // Get the MAIL message (body and headers)
                                    msg.on("body", (stream: NodeJS.ReadableStream, info: imapConnection.ImapMessageBodyInfo) => {
                                        // simpleParser is used to convert stream into mail message (with attachments)
                                        // See https://nodemailer.com/extras/mailparser/
                                        simpleParser(stream, (mailError: any, mail: ParsedMail) => {
                                            if (mailError) {
                                                // Eror parsing mail message
                                            } else {
                                                this.HandleNewMail(mail)
                                            }
                                        });
                                    });
                                    /*
                                    msg.on("end", () => {
                                        // Called when attributes and body events are called!
                                        // Since simpleParser in body is async the mail body does't have to be parsed yet!!!!!!
                                    });
                                    msg.once("attributes", (attrs: ImapMessageAttributes) => {
                                        // Used to get mail flags (SEEN etc.)
                                        const { uid } = attrs;
                                        uid_id = uid;
                                    });
                                    */
                                });
                                //  When there is an error in fetching mails
                                fetchRequest.on("error", (error: Error) => {
                                    this.connection.end();
                                });
                                fetchRequest.once("end", () => {
                                    this.connection.end();
                                });
                            }
                        });
                    } catch (e) {
                        this.connection.end();
                    }
                }
            });
        });
    }

    private ImapConnectionError(error: any) {

    }

    private ImapConnectionClosed() {

    }


    public ReadMailBox() {
        this.connection.connect();
    }

    private HandleNewMail(mail: ParsedMail): void {

    }

    /*
    //const fullFilePath = path.join(workspace, dir, fileName);
                
                                            const emailEnvelop: MailEnvelop = {
                                                from: mail.from.text,
                                                to: mail.to.text,
                                                date: mail.date,
                                                subject: mail.subject,
                                                text: mail.text,
                                                attachments: new Array<Attachment>()
                                            };
                
                
                
                                            // write attachments
                                            if (mail.attachments) {
                                                for (let i = 0; i < mail.attachments.length; i += 1) {
                
                                                    const attachment = mail.attachments[i];
                
                                                    const { filename } = attachment;
                
                                                   // if (emailEnvelop.attachments) emailEnvelop.attachments.push(filename);
                
                                                    //fs.writeFileSync(path.join(workspace, dir, filename), attachment.content, ‘base64’); // take encoding from attachment ?
                
                                                }
                
                                            }
                                            */

}