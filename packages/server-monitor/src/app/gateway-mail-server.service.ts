import { Injectable } from '@angular/core';
import { MAILGATEWAY_BASE_PATH } from './../Config';
import { Configuration, ManagementApi, MailData } from './../generated_rest_api/index';

@Injectable({
  providedIn: 'root'
})
export class GatewayMailServerService {
  private restClient: ManagementApi;
  constructor() {
    const url = MAILGATEWAY_BASE_PATH;
    this.restClient = new ManagementApi(undefined, url, undefined);
  }

  public SendMail(mailData: MailData) {
    this.restClient.sendTestMail(mailData, false)
        .then((result) => {

        }).catch((error) => {

        });
}
}
