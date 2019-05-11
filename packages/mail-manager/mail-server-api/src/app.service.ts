import { Injectable } from '@nestjs/common';
import { MailAccountsResult} from './models/restmodels';

const fs = require('fs');


@Injectable()
export class AppService {
   async getDefault(): Promise<string> {
   
     //await this.execShellCommand("addmailuser testje@abc.com abc");
    //return 
    return fs.readFileSync('src/index.html','utf8');
  
}

public async GetMailAccounts(): Promise<MailAccountsResult> {
  const accountString = await this.execShellCommand('listmailuser');
  const accounts = accountString.split(/\r?\n/);
  const x : MailAccountsResult = { 
     Accounts: accounts
   };  
  return x;
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
 async execShellCommand(cmd) : Promise<string> {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
   exec(cmd, (error, stdout, stderr) => {
    console.log("execute hallo!!");
    if (error) {
      console.log(stderr);
      reject(stderr);
    }
    console.log(stdout);
    resolve(stdout);
   });
  });
 }
}
