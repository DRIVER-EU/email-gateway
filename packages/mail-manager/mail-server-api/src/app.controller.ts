
import { AppService } from './app.service';
import { Controller, Get, Inject, Param, Req, Put, Post, Body, Query } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiImplicitParam, ApiUseTags, ApiImplicitBody, ApiImplicitQuery } from '@nestjs/swagger';
import { MailAccountsResult, AddMailAccountResult, DeleteMailAccountResult, ResetResult } from './models/restmodels';

@ApiUseTags('MailManagement')
@Controller('MailManagement')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiOperation({
    title: 'Get mail accounts',
    description: 'Get mail accounts',
    operationId: 'MailAccounts',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the mail accounts',
    type: MailAccountsResult,
  })
  @Get('MailAccounts')
  async GetMailAccounts(): Promise<MailAccountsResult> {
    if (this.appService === null) { throw new Error('Not initialized (yet)'); }
    return await this.appService.GetMailAccounts();
  }
  /*******************************************************************************************/
  @ApiOperation({
    title: 'Add mail account',
    description: 'Add mail account to mail server (e.g. "user@world.com") ',
    operationId: 'AddAccount',
  })
  @ApiImplicitQuery({
    name: 'account',
    description: 'The mail account',
    required: true,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'password',
    description: 'The mail account password',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: AddMailAccountResult,
  })
  @Post('AddMailAccount')
  async AddMailAccount(@Query('account') account: string, @Query('password') password: string): Promise<AddMailAccountResult> {
    if (this.appService === null) { throw new Error('Not initialized (yet)'); }
    return await this.appService.AddMailAccount(account, password);
  }

  /*******************************************************************************************/
  @ApiOperation({
    title: 'Delete mail account',
    description: 'Delete mail account to mail server "user@world.com" ',
    operationId: 'DeleteAccount',
  })
  @ApiImplicitQuery({
    name: 'account',
    description: 'The mail account',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: DeleteMailAccountResult,
  })
  @Post('DeleteMailAccount')
  async DeleteMailAccount(@Query('account') account: string): Promise<DeleteMailAccountResult> {
    if (this.appService === null) { throw new Error('Not initialized (yet)'); }
    return await this.appService.DeleteMailAccount(account);
  }

  /*******************************************************************************************/
  @ApiOperation({
    title: 'Reset',
    description: 'Reset',
    operationId: 'Resetbase',
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: ResetResult,
  })
  @Post('Reset')
  async Reset(): Promise<ResetResult> {
    if (this.appService === null) { throw new Error('Not initialized (yet)'); }
    return await this.appService.Reset();
  }

}
