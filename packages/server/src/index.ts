import { MailGatewayServer } from './main';
import * as npmPackage from './../package.json';

/* 
Initial ENTRY point to start E-MAIL gateway
*/
console.log(`Start service "${npmPackage.name}, v${npmPackage.version}"`);
console.log(`Description: "${npmPackage.description}"`);
const app: MailGatewayServer = new MailGatewayServer();





