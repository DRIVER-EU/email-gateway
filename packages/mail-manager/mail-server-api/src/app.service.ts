import { Injectable } from '@nestjs/common';
import { MailAccountsResult, AddMailAccountResult, DeleteMailAccountResult } from './models/restmodels';

import fs = require('fs');

@Injectable()
export class AppService {

 async getDefault(): Promise<string> {
     // await this.execShellCommand("addmailuser testje@abc.com abc");
    // return 
    return fs.readFileSync('src/index.html','utf8');
}

async AddMailAccount(accountName : string, password : string): Promise<AddMailAccountResult> {
  console.log(`Add mail account '${accountName}'. `);
  if (this.isRunningInDocker()) {
    this.execShellCommand(`addmailuser ${accountName} ${password}`);
  }
  const result = new AddMailAccountResult();
  return result;
}

async DeleteMailAccount(accountName: string): Promise<DeleteMailAccountResult> {
  console.log(`Delete mail account '${accountName}'. `);
  if (this.isRunningInDocker()) {
    this.execShellCommand(`removemailuser ${accountName}`);
  }
  const result = new DeleteMailAccountResult();
  return result;
}

private isRunningInDocker(): boolean {
  return process.platform === 'linux';
}

public async GetMailAccounts(): Promise<MailAccountsResult> {
  if (this.isRunningInDocker()) {
     const accountString = await this.execShellCommand('listmailuser');
     const accounts = accountString.split(/\r?\n/);
     const x: MailAccountsResult = {
         Accounts: accounts,
      };
      return x;
  } else {
    const x: MailAccountsResult = {
      Accounts: [ "test@a.com", "dummy@b.com"]
   };
   return x;
  }
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
 async execShellCommand(cmd : string) : Promise<string> {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
   exec(cmd, (error : any, stdout: any, stderr: any) => {
    if (error) {
      console.log("Shell execution error: " + stderr);
      reject(stderr);
    }
    // console.log(stdout);
    resolve(stdout);
   });
  });
 }
}
