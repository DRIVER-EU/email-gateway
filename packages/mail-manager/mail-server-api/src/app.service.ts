import { Injectable } from '@nestjs/common';
import { MailAccountsResult, AddMailAccountResult, DeleteMailAccountResult, ResetResult, ChangePasswordMailAccountResult } from './models/restmodels';

import fs = require('fs');
import log4js = require('log4js');
const logger = log4js.getLogger('mailApi');

@Injectable()
export class AppService {

  // async getDefault(): Promise<string> {
  //     // await this.execShellCommand("addmailuser testje@abc.com abc");
  //    // return
  //    return fs.readFileSync('src/index.html', 'utf8');
  // }

  async ChangePasswordMailAccount(accountName: string, password: string): Promise<ChangePasswordMailAccountResult> {
    // tslint:disable-next-line: no-console
    logger.info(`REST command: Change password mail account '${accountName}'. `);
    if (this.isRunningInDocker()) {
      this.execShellCommand(`updatemailuser ${accountName} ${password}`)
      .then(x => {} );
    }
    const result = new ChangePasswordMailAccountResult();
    result.Msg = `Change password mail account '${accountName}'. `;
    return result;
  }
  
  async AddMailAccount(accountName: string, password: string): Promise<AddMailAccountResult> {
    // tslint:disable-next-line: no-console
    logger.info(`REST command: Add mail account '${accountName}'. `);
    if (this.isRunningInDocker()) {
      this.execShellCommand(`addmailuserandsieve ${accountName} ${password}`)
      .then(x => {} );
    }
    const result = new AddMailAccountResult();
    result.Msg = `Add mail account '${accountName}'. `;
    return result;
  }

  async DeleteMailAccount(accountName: string): Promise<DeleteMailAccountResult> {
    if (accountName === 'admin@driver.eu') {
      const result1 = new DeleteMailAccountResult();
      result1.Msg = `Not allowed to delete '${accountName}'. `;
      return result1;
    }
    // tslint:disable-next-line: no-console
    logger.info(`REST command: Delete mail account '${accountName}'. `);
    if (this.isRunningInDocker()) {
      this.execShellCommand(`delmailuser -y ${accountName}`);
    }
    const result = new DeleteMailAccountResult();
    result.Msg = `Delete mail account '${accountName}'. `;
    return result;
  }

  async Reset(): Promise<ResetResult> {
    // tslint:disable-next-line: no-console
    logger.info(`REST command: Reset. `);
    if (this.isRunningInDocker()) {
      const accountString = await this.execShellCommand('listmailuser');
      const accounts = accountString.split(/\r?\n/).filter(Boolean);
      accounts.forEach(account => this.DeleteMailAccount( account));
      const x: ResetResult = {
        Msg: 'Reset',
      };
      return x;
    } else {
      const x: ResetResult = {
        Msg: 'Reset',
      };
      return x;
    }
  }

  private isRunningInDocker(): boolean {
    return process.platform === 'linux';
  }

  public async GetMailAccounts(): Promise<MailAccountsResult> {
    // tslint:disable-next-line: no-console
    logger.info(`REST command: Get mail accounts. `);
    if (this.isRunningInDocker()) {
      const accountString = await this.execShellCommand('listmailuser');
      const accounts = accountString.split(/\r?\n/);
      const x: MailAccountsResult = {
        Accounts: accounts,
      };
      return x;
    } else {
      const x: MailAccountsResult = {
        Accounts: ['nodocker@demo.com'],
      };
      return x;
    }
  }

  /**
   * Executes a shell command and return it as a Promise.
   * @param cmd {string}
   * @return {Promise<string>}
   */
  async execShellCommand(cmd: string): Promise<string> {
    const exec = require('child_process').exec;
    logger.info('Shell execute cmd: ' + cmd);
    return new Promise((resolve, reject) => {
      exec(cmd, (error: any, stdout: any, stderr: any) => {
        if (error) {
          // tslint:disable-next-line: no-console
          logger.error('Shell execution error: ' + stderr);
          reject(stderr);
        }
        // tslint:disable-next-line: no-console
        // logger.info('Shell response: ' + stdout);
        resolve(stdout);
      });
    });
  }
}
