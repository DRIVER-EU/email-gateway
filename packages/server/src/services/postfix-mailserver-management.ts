import { Address } from "nodemailer/lib/mailer";
import {
  AddMailAccountResult,
  DeleteMailAccountResult,
  ResetResult,
} from "../../swagger_codegenerator/generated_code/api.js";
import { MailManagementApi } from "../generated_rest_api/index.js";
import { mailAddressConverter } from "./../helpers/mailAdressesConverter.js";

// Services:
import { IConfigService } from "./config-service.js";
import { ILogService } from "./log-service.js";
import { GlobalConst } from "../global-const.js";

export interface IPostfixMailServerManagementService {
  mailAccounts(): Promise<string[]>;
  addEMailAddressesAdv(mailAddresses: Address[]): Promise<void>;
  addEMailAddresses(mailAddresses: string[]): Promise<void>;
  addEMailAddress(mailAddress: string): Promise<void>;
  addAccount(
    accountName: string,
    password: string
  ): Promise<AddMailAccountResult>;
  deleteMailAccount(accountName: string): Promise<DeleteMailAccountResult>;
  reset(): Promise<ResetResult>;
}

export class PostfixMailServerManagementService
  implements IPostfixMailServerManagementService
{
  private restClient: MailManagementApi;

  constructor(
    private logService: ILogService,
    private configService: IConfigService
  ) {
    const url = configService.ApiMailServerUrl.replace(/\/+$/, "");
    logService.LogMessage(`Use url '${url}' mail server api.`);
    this.restClient = new MailManagementApi(undefined, url, undefined);
  }

  async mailAccounts(): Promise<string[]> {
    const mailAdresses = await this.restClient.mailAccounts();
    return mailAdresses.Accounts;
  }

  async addEMailAddressesAdv(mailAdresses: Address[]): Promise<void> {
    mailAdresses.forEach((mailAddress) => {
      this.addMailAdressInternal(mailAddress);
    });
  }

  async addEMailAddresses(mailAdresses: string[]): Promise<void> {
    mailAdresses.forEach((mailAddress) => {
      this.addEMailAddress(mailAddress);
    });
  }

  // 'Name <address@domain>', 'Name1 <name1@domain>'
  async addEMailAddress(mailAddress: string): Promise<void> {
    mailAddressConverter(mailAddress).forEach((x) =>
      this.addMailAdressInternal(x)
    );
  }

  async addMailAdressInternal(mailAddress: Address): Promise<void> {
    const address =
      mailAddress.address.toLocaleLowerCase(); /* for some reason capital login fails */
    const mailAccounts = await this.restClient.mailAccounts();
    if (!mailAccounts.Accounts.includes(address)) {
      this.logService.LogMessage(
        `Add account  '${address}' with password '${GlobalConst.defaultMailPassword}' to mailserver`
      );
      this.restClient
        .addAccount(GlobalConst.defaultMailPassword, address)
        .then((result: AddMailAccountResult) => {
          this.logService.LogMessage(
            `Add mail account response: ${result.Msg}.`
          );
        })
        .catch((reason: any) =>
          this.logService.LogErrorMessage(
            `Failed to add mail account ${address}; error ${reason}`
          )
        );
    }
  }

  public async addAccount(
    accountName: string,
    password: string
  ): Promise<AddMailAccountResult> {
    return this.restClient.addAccount(password, accountName);
  }

  public async deleteMailAccount(
    accountName: string
  ): Promise<DeleteMailAccountResult> {
    return this.restClient.deleteAccount(accountName);
  }

  public async reset(): Promise<ResetResult> {
    return this.restClient.resetbase();
  }
}
