import { Attachment } from 'nodemailer/lib/mailer';
import { ISimulationEntityPost, MediumTypes } from '../models/simulation-entity-post';

const uuidv4 = require('uuid/v4');


export const testPost: ISimulationEntityPost = {
    mediumType: MediumTypes.MAIL,
    id: uuidv4(),
    senderName: 'Person a <a@demo.com>',
    recipients: [ 'Person b <b@demo.com>', 'c@demo.com'],
    name: 'This is the subject of the mail',
    body: '<b>Hello reader</b><br>This is the message',
    date: new Date('2019-12-11T10:20:30Z').getTime() /* EPOCH TIME (msec since 1970, 1 jan) */,
    owner: '',
    mediumName: '',
    visibleForParticipant: true,
    files: [
        'http://localhost/testfile',
        'dit is gewoon een tekst bericht',
        'ZGl0IGlzIGdld29vbiBlZW4gdGVrc3QgYmVyaWNodA==' /* base64 meesage */
    ]
  };