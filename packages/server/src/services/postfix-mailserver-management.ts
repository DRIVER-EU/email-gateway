import { MailManagementApi, Configuration, MailAccountsResult } from './../generated_rest_api/index';
import { MAILSERVER_BASE_PATH } from './../config';
import mailAddressesParser = require('nodemailer/lib/addressparser');
import { Address  } from 'nodemailer/lib/mailer';
import { mailAddressConverter } from './../helpers/mailAdressesConverter';

// Services:
import { IConfigService } from './config-service';
import { ILogService } from './log-service';

export interface IPostfixMailServerManagementService {
    mailAccounts(): Promise<string[]>;
    addEMailAddressesAdv(mailAddresses: Address[]): Promise<void>;
    addEMailAddresses(mailAddresses: string[]): Promise<void>;
    addEMailAddress(mailAddress: string): Promise<void>;
}

const defaultMailPassword = 'default';


export class PostfixMailServerManagementService implements IPostfixMailServerManagementService {
    private restClient: MailManagementApi;

    constructor(
        private logService: ILogService,
        private configService: IConfigService) {
        const url = MAILSERVER_BASE_PATH;
        this.restClient = new MailManagementApi(undefined, url, undefined);
    }

    async mailAccounts(): Promise<string[]> {
        const mailAdresses = await this.restClient.mailAccounts();
        return mailAdresses.Accounts;
    }

    async addEMailAddressesAdv(mailAdresses: Address[]): Promise<void> {
        mailAdresses.forEach(mailAddress => {
            this.addMailAdressInternal(mailAddress);
        });
    }

    async addEMailAddresses(mailAdresses: string[]): Promise<void> {
        mailAdresses.forEach(mailAddress => {
            this.addEMailAddress(mailAddress);
        });
    }

    // 'Name <address@domain>', 'Name1 <name1@domain>'
    async addEMailAddress(mailAddress: string): Promise<void> {
       mailAddressConverter(mailAddress).forEach(x => this.addMailAdressInternal(x));
    }

    async addMailAdressInternal(mailAddress: Address): Promise<void> {
        const mailAccounts = await this.restClient.mailAccounts();
        if (!mailAccounts.Accounts.includes(mailAddress.address)) {
                this.restClient.addAccount(mailAddress.address, defaultMailPassword);
            }
        }
    }
}

