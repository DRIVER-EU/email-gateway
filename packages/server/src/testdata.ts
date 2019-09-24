

const uuidv4 = require('uuid/v4');
import { ISimulationEntityPost, MediumTypes } from './models/simulation-entity-post';

export const posts: ISimulationEntityPost[] = [
  {
    guid: uuidv4(),
    name: 'TETS',
    owner: 'TEST',
    mediumType: MediumTypes.MAIL,
    mediumName: 'test-bed',
    senderName: 'sender@dmmy.com',
    recipients: ['a@b.com', 'c@d.com'],
    visibleForParticipant: true,
    date: Date.now(),
    location: undefined,
    body: `Test message`,
    files: ['Dit is een attachment']
  },

];