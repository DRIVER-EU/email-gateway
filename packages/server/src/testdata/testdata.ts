import { Attachment } from 'nodemailer/lib/mailer';
import { ISimulationEntityPost, MediumTypes } from '../models/simulation-entity-post';

const uuidv4 = require('uuid/v4');


export const testPost: ISimulationEntityPost = {
    mediumType: MediumTypes.MAIL,
    guid: uuidv4(),
    senderName: 'Person a <a@demo.com>',
    recipients: [ 'Person b <b@demo.com>', 'c@demo.com'],
    name: 'This is the subject of the mail',
    body: '<b>Hello reader</b><br>This is the message',
    date: new Date('2019-04-11T10:20:30Z').getTime() / 1000 /* UNIX EPOCH TIME (convert msec to sec) */,
    owner: '',
    mediumName: '',
    visibleForParticipant: true,
    files: [
        'http://localhost/testfile',
        'dit is gewoon een tekst bericht',
        'ZGl0IGlzIGdld29vbiBlZW4gdGVrc3QgYmVyaWNodA==' /* base64 meesage */
    ]
  };