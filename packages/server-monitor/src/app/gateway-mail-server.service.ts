import { Injectable } from '@angular/core';
import { MAILGATEWAY_BASE_PATH } from './../Config';
import { Configuration, ManagementApi, MailData, MailAccountsResultImpl,
  DeleteMailAccountResultImpl, AddMailAccountResultImpl, ResetResultImpl } from './../generated_rest_api/index';

@Injectable({
  providedIn: 'root'
})
export class GatewayMailServerService {
  private restClient: ManagementApi;
  constructor() {
    const url = MAILGATEWAY_BASE_PATH;
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
}
