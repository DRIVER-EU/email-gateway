// https://github.com/sahat/Nodemailer
import { IMapSettings } from './../services/mail-service';
import { Attachment } from 'nodemailer/lib/mailer';
import { simpleParser, ParsedMail } from 'mailparser';
import { SendMailOptions as MailEnvelop, } from 'nodemailer';
import { Box as MailBox, ImapMessage, ImapMessageAttributes, Config as ImapConfig } from 'imap';
import imapConnection = require('imap');
import { EventEmitter } from 'events';

const util = require('util');
const imap = require('imap');

const MailBoxName = 'Sent';

let eventToPromise = require('event-to-promise');
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
// https://www.npmjs.com/package/event-to-promise
export interface IReadMail {

    on(event: 'NewMail', listener: (mail: ParsedMail) => void): this;
    on(event: 'MailRetreiveError', listener: (uid: number) => void): this;
    on(event: 'Finished', listener: (latestUid: number) => void): this;
}

export class ReadMail extends EventEmitter implements IReadMail {

    private connection: imapConnection;
    private uidLatest: number;
    private highestUid: number;
    private connectionCfg: ImapConfig;
    constructor(private imapCfg: IMapSettings, mailaccount: string, mailaccountPwd: string, latestMailUid: number = 0) {
        super();

        this.uidLatest = latestMailUid;
        this.connectionCfg = {
            user: mailaccount,
            password: mailaccountPwd,
            host: imapCfg.IMapHost,
            port: imapCfg.IMapPort,
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false
            }
        };
        this.highestUid = latestMailUid;
        this.connection = new imapConnection( this.connectionCfg);
        this.connection.once('error', this.ImapConnectionError.bind(this));
        this.connection.once('end', this.ImapConnectionClosed.bind(this));
        // Once the mail box ready


    }
    /*
        let getChuckNorrisFact = () => {
            return new Promise(
              (resolve, reject) => {
                this.connection.getBoxes((error: Error, mailboxes: imapConnection.MailBoxes) => {
                   if (error) reject(error);
                  resolve();
                });
             }
           );
          }
          */
    /*
    Message Sequence Numbers vs UID
    Each message in IMAP has two numbers: it’s message sequence number, and it’s unique identifier. The unique identifier is pretty self-explanatory, with a few caveats following, and the message sequence number is the relative position from the oldest message in the folder. If messages are deleted, sequence numbers are reordered to fill any gaps. As can be imagined this a source of a lot mistakes because if you’re looping through a list of message sequence numbers ascendingly, deleting messages as you go, you’ll end up deleting the wrong messages. The imaplib highlights this problem:

    After an EXPUNGE command performs deletions the remaining messages are renumbered, so it is highly advisable to use UIDs instead, with the UID command.

    So how does one use the UID command? Surprisingly easy. Take whatever command you were going to execute and prefix it with UID. We’ll modify the example earlier to use UIDs instead.
    */
    /*
     private mailBoxOpened(err: Error, box: MailBox) {
         if (err) {
             console.log(err);
         } else {
 
             try {
                 // Search for new mails (Mails where UID is greater then latest UID)
                 // If the search should return Seq Number use: this.connection.seq.search
                 const search: string = (this.uidLatest === 0) ? '1:*' /* all mails * / : `${this.uidLatest + 1}:*`;
                 this.connection.search([['UID', search]], (err1: Error, uidNumbers: number[] /* UID numbers * /) => {
                     if ((!uidNumbers) ||
                         (uidNumbers.length === 1) && (uidNumbers[0] === this.uidLatest)) {
                         // No new mails found!
                         this.connection.end();
                     } else {
                         let NumberOfMsgToProcess = uidNumbers.length;
                         // Fetch the mail content of the found UIDs
                         // Use this.connection.seq.fetch to fetch mail by seq number
                         let fetchRequest = this.connection.fetch(uidNumbers, {
                             // bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)',
                             bodies: '' /*'BODY.PEEK[]',
                             struct: true* /
                         });
                         // Handle all the mails from fetch command
                         fetchRequest.on('message', (msg: ImapMessage, uid: number) => {
                             if (uid > this.highestUid) this.highestUid = uid;
                             // Get the MAIL message (body and headers)
                             msg.once('body', (stream: NodeJS.ReadableStream, info: imapConnection.ImapMessageBodyInfo) => {
                                 // simpleParser is used to convert stream into mail message (with attachments)
                                 // See https://nodemailer.com/extras/mailparser/
                                 simpleParser(stream, (mailError: any, mail: ParsedMail) => {
                                     if (mailError) {
                                         // Eror parsing mail message
                                     } else {
                                         //this.HandleNewMail(mail);
                                     }
                                     NumberOfMsgToProcess--;
                                     if (NumberOfMsgToProcess === 0) this.connection.end();
                                 });
                             });
 
                             msg.once('end', () => {
                                 // Called when attributes and body events are called!
                                 // Since simpleParser in body is async the mail body does't have to be parsed yet!!!!!!
                             });
                             msg.once('attributes', (attrs: ImapMessageAttributes) => {
                                 // Used to get mail flags (SEEN etc.)
                                 const { uid } = attrs;
                                 // uid_id = uid;
                             });
 
                         });
                         //  When there is an error in fetching mails
                         fetchRequest.once('error', (error: Error) => {
                             this.connection.end();
                         });
                         fetchRequest.once('end', () => {
                             // The fetch is finished, but the mailParser could still be busy parsing the mail
 
                         });
                     }
                 });
             } catch (e) {
                 this.connection.end();
             }
         }
     }
 
     */

    private ImapConnectionError(error: any) {
        this.TriggerFinishedEvent();
    }

    private ImapConnectionClosed() {
        this.TriggerFinishedEvent();
    }

    private TriggerFinishedEvent() {
        this.emit('Finished', this.highestUid);
    }

    private SendMailRetreiveErrorEvent(uid: number) {
        this.emit('MailRetreiveError', uid);
    }

    private SendNewMailEvent(mail: ParsedMail): void {
        this.emit('NewMail', mail);
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async FetchMails(): Promise<void> {
        const connectedToMailServer = eventToPromise(this.connection, 'ready');


        /* this.connection.once('ready', async () => {

             const mailBoxes = await this.getAllMailBoxes();
             this.connection.openBox('Sent', false /* readonly * /, (err: Error, box: MailBox) => this.mailBoxOpened(err, box));
         }); */
        this.connection.connect();
        await connectedToMailServer;
        const searchText: string = (this.uidLatest === 0) ? '1:*' /* all mails */ : `${this.uidLatest + 1}:*`;
        const mailBoxes = await this.getAllMailBoxes();
        const mailBox = await this.openMailBox();
        const uuids = await this.searchUUID(searchText);
        if ((!uuids) || (uuids.length === 0) || (uuids.length === 1) && (uuids[0] === this.uidLatest)) {
            // No new mails found!
            this.connection.end();
        } else {
            let mailQueue = new Map<number, ParsedMail>();
            let NumberOfMsgToProcess = uuids.length;
            // Fetch the mail content of the found UIDs
            // Use this.connection.seq.fetch to fetch mail by seq number
            // bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)'

            try {
                let fetchRequest = this.connection.fetch(uuids, { bodies: '' /*'BODY.PEEK[]', struct: true*/ });
                // fetchRequest.once('error', (error) => { console.log(); });
                const fetch = eventToPromise.multi(fetchRequest, ['end'], ['error']);
                fetchRequest.on('message', (msg: ImapMessage, uid: number) => this.parseMail(msg, uid, mailQueue));
                const waitHandle = await fetch; // All fetches finished
                fetchRequest.removeAllListeners();

            } catch (e) {
                console.log('error');
            }

            // The fetch is finished, but the parsing of the e-mail can not be finished (therefor queue)
            while (mailQueue.size !== uuids.length) {
                await this.sleep(1000);
            }
            for (let [uid, mailMsg] of mailQueue) {
                if (uid > this.highestUid) this.highestUid = uid;
                try {
                    this.SendNewMailEvent(mailMsg);
                } catch (e) {
                    this.SendMailRetreiveErrorEvent(uid);
                }
            }
        }
        this.connection.end();
    }

    private parseMail(msg: ImapMessage, uid: number, queque: Map<number, ParsedMail>) {

        // Get the MAIL message (body and headers)
        msg.once('body', async (stream: NodeJS.ReadableStream, info: imapConnection.ImapMessageBodyInfo) => {
            // simpleParser is used to convert stream into mail message (with attachments)
            // See https://nodemailer.com/extras/mailparser/
            const parsedMail = await simpleParser(stream);
            queque.set(uid, parsedMail);

        });
        msg.once('attributes', (attrs: ImapMessageAttributes) => {
            // Used to get mail flags (SEEN etc.)
            const { uid } = attrs;
            // uid_id = uid;
        });
        msg.once('end', () => {
            // Called when attributes and body events are called!
            // Since simpleParser in body is async the mail body does't have to be parsed yet!!!!!!
        });

    }

    public getHighestUid(): number {
        return this.highestUid;
    }



    // Convert search to promise
    private searchUUID(searchText: string): Promise<number[]> {
        return new Promise((resolve, reject) => {
            this.connection.search([['UID', searchText]], (err: Error, uidNumbers: number[] /* UID numbers */) => {
                if (err) reject(err.message); else resolve(uidNumbers);
            });
        });
    }

    // Convert openBox to promise
    private openMailBox(): Promise<MailBox> {
        return new Promise((resolve, reject) => {
            this.connection.openBox(MailBoxName, false /* readonly */, (err: Error, box: MailBox) => {
                if (err) reject(err.message); else return resolve(box);
            });
        });
    }

    // Convert getBoxes to promise
    private getAllMailBoxes(): Promise<imapConnection.MailBoxes> {
        return new Promise((resolve, reject) => {
            this.connection.getBoxes((error: Error, mailboxes: imapConnection.MailBoxes) => {
                if (error) reject(); else resolve(mailboxes);
            });
        });
    }



}