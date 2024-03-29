import { MailGatewayServer } from "./main.js";
import npmPackage from "./../package.json" assert { type: "json" };

/*
Initial ENTRY point to start E-MAIL gateway
*/

process.on("exit", function (code) {
  return console.log(`Exit with code ${code}`);
});

process.on("SIGTERM", function () {
  console.log("Control-c received");
});
console.log(`Start service "${npmPackage.name}, v${npmPackage.version}"`);
console.log(`Description: "${npmPackage.description}"`);
const app: MailGatewayServer = new MailGatewayServer();
