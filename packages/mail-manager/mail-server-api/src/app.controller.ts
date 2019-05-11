
import { AppService } from './app.service';
import { Controller, Get, Inject, Param, Req, Put, Body } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiImplicitParam, ApiUseTags, ApiImplicitBody } from '@nestjs/swagger';
import { MailAccountsResult } from './models/restmodels';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getDeault(): Promise<string> {
    return this.appService.getDefault();
  }

  @ApiOperation({
    title: 'Get mail accounts',
    description: 'Get mail accounts',
    operationId: 'MailAccounts'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the mail accounts',
    type: MailAccountsResult
  })
  @Get('MailAccounts')
  async GetMailAccounts(): Promise<MailAccountsResult> {
    if (this.appService === null) throw new Error("Not initialized (yet)");
    return await this.appService.GetMailAccounts();

  }
}
