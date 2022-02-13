import { Attachment } from 'nodemailer/lib/mailer';
import { IPost } from '../models/avro_generated/simulation_entity_post-value';

const uuidv4 = require('uuid');


export const testPost: IPost = {
    type: 'MAIL',
    id: uuidv4(),
    header: {
        date: new Date('2019-12-11T10:20:30Z').getTime(), /* EPOCH TIME (msec since 1970, 1 jan) */
        from: 'Person a <a@demo.com>',
        to: [ 'Person b <b@demo.com>', 'c@demo.com'],
        cc: undefined,
        bcc: undefined,
        subject: 'subject',
        intro: undefined,
        location: undefined,
        attachments: {
            'http://localhost/testfile': '.txt',
            'dit is gewoon een tekst bericht': '.txt',
            'ZGl0IGlzIGdld29vbiBlZW4gdGVrc3QgYmVyaWNodA==' /* base64 meesage */: '.txt'
        }
    },
    name: 'This is the subject of the mail',
    body: '<b>Hello reader</b><br>This is the message',
    timestamp: new Date('2019-12-11T10:20:30Z').getTime(),
    owner: ''
  };