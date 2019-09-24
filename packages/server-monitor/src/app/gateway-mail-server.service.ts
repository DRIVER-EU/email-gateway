import { Statusresult } from './../generated_rest_api/api';
import { Injectable } from '@angular/core';
import { Configuration, ManagementApi, MailData, MailAccountsResultImpl,
  DeleteMailAccountResultImpl, AddMailAccountResultImpl, ResetResultImpl } from './../generated_rest_api/index';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GatewayMailServerService {
  private restClient: ManagementApi;
  constructor() {
    const url = environment.serverRestApiUrl.replace(/\/+$/, '');
    console.log(`Mail API REST url ${url}`);
    this.restClient = new ManagementApi(undefined, url, undefined);
  }

  public async SendMail(mailData: MailData, useKafka: boolean) {
    return this.restClient.sendTestMail(mailData, useKafka);
  }

  public async getAccounts(): Promise<MailAccountsResultImpl> {
    return this.restClient.mailAccounts();
  }
  public async deleteAccount(account: string): Promise<DeleteMailAccountResultImpl> {
    return this.restClient.deleteAccount(account);
  }

  public async addAccount(account: string, password: string): Promise<AddMailAccountResultImpl> {
    return this.restClient.addAccount(password, account);
  }
  public async reset(): Promise<ResetResultImpl> {
    return this.restClient.reset();
  }

  public async getServerStatus(): Promise<Statusresult> {
    return this.restClient.getStatus();
  }
}
