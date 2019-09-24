import { Attachment } from 'nodemailer/lib/mailer';
import { ISimulationEntityPost, MediumTypes } from '../models/simulation-entity-post';

const uuidv4 = require('uuid/v4');


export const testPost: ISimulationEntityPost = {
    mediumType: MediumTypes.MAIL,
    guid: uuidv4(),
    senderName: '"Mister ABC <ABC@demo.com>',
    recipients: [ '"Mister DEF <DEF@demo.com>", "GHI@demo.com'],
    name: 'This is the subject of the mail',
    body: '<b>Hello reader</b><br>This is the message',
    date: new Date(2019 /* year */, 9 /* month */, 17 /* day */, 15 /* hour */, 30 /* min */).getTime(),
    owner: '',
    mediumName: '',
    visibleForParticipant: true,
    files: [
        'http://localhost/testfile'
    ]
  };