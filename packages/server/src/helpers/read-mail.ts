//import { Attachment } from 'nodemailer/lib/mailer';
//import { Attachment } from 'nodemailer/lib/mailer';
import { Attachment } from 'nodemailer/lib/mailer';
/*import fs from ‘fs’;

import base64 from ‘base64-stream’;

import path from ‘path’;

import { simpleParser } from ‘mailparser’;

import Imap fromimport { AnyARecord } from "dns";
 ‘imap’; */

// https://github.com/sahat/Nodemailer

import { simpleParser, ParsedMail } from "mailparser";

import imapConnection = require("imap");
import { SendMailOptions as MailEnvelop, } from 'nodemailer';
import { Box as MailBox, ImapMessage } from "imap";

export class ReadMail {

    private connection: imapConnection;
    private imapLibary: any;
    private inspectImap: any;
    constructor() {
        var imap = require('imap');
        //this.inspectImap = require('util').inspect;

        this.connection = new imapConnection({
            user: 'account@b.com',
            password: 'default',
            host: 'localhost',
            port: 993,
            tls: true,

            tlsOptions: {
                rejectUnauthorized: false
            }
        });
    }

    /* Search:
    imap.search([‘UNSEEN’, [‘HEADER’, ‘SUBJECT’,“hello world”]], (err1, results) => {
    
    if (err1) {
    
    console.log(err1);
    
    }
    
    try {
    
    // const f = imap.fetch(results, { bodies: ‘TEXT’ });
    
    const f = imap.fetch(results, {
    
    bodies: ‘’, // “[\’HEADER.FIELDS (FROM TO SUBJECT DATE)\’, ‘’]”,
    
    struct: true,
    
    });
    */

    public ReadMail() {
        this.connection.once("error", (err: any) => {


        });

        this.connection.once("end", () => {



        });
        //Once the mail box is read to open
        this.connection.once("ready", () => {
            this.connection.openBox("INBOX", false /* readonly */, (err: Error, box: MailBox) => {
                if (err) {
                    console.log(err);
                    throw err;
                }

                var f = this.connection.seq.fetch('*', {
                    bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                    struct: true
                });
                f.on("message", (msg: ImapMessage, seqno: number) => {

                    const prefix = `(#${seqno}) `;
                    msg.on("body", (stream: NodeJS.ReadableStream, info: imapConnection.ImapMessageBodyInfo) => {

                        simpleParser(stream, (err2: any, mail: ParsedMail) => {

                            if (err2) {



                            }

                            const fileName = `msg-${seqno}-body.txt`;

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

                        });

                    });

                    msg.once("attributes", (attrs: any) => {
                        var  inspect = require('util').inspect;
                        console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                        // Mark the above mails as read

                        const { uid } = attrs;

                        this.connection.addFlags(uid, ["\\Seen"], (err2) => {

                            if (err2) {



                            } else {



                            }

                        });

                    });

                });

                f.once("end", () => {

                    this.connection.end();

                });



                this.connection.end();

            });




        });
        this.connection.connect();
    }


}