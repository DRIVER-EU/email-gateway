

const uuidv4 = require('uuid/v4');
import { IPost } from './models/avro_generated/simulation_entity_post-value';

export const posts: IPost[] = [
  {
    id: uuidv4(),
    name: 'TEST',
    owner: 'TEST',
    type: 'MAIL',
    header: {
      date: Date.now(),
      from: 'sender@dummy.com',
      to: ['a@b.com', 'c@d.com'],
      cc: null,
      bcc: null,
      intro: undefined,
      subject: 'testMail.Subject',
      location: undefined,
      attachments: undefined,
    },
    timestamp: Date.now(),
    body: `Test message`
  },

];

