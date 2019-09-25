import { Controller, Get, Inject, Param, Req, Put, Body, Query, ValidationPipe, Post } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiImplicitParam, ApiUseTags, ApiImplicitBody, ApiImplicitQuery } from '@nestjs/swagger';
import { ManagementService } from './management.service';
import { MailData, Statusresult, MailAccountsResultImpl, AddMailAccountResultImpl, DeleteMailAccountResultImpl, ResetResultImpl } from './../models/rest/rest-models';



import { ISimulationEntityPost, MediumTypes } from './../models/simulation-entity-post';
const uuidv4 = require('uuid/v4');

/*

Entrypoint for all management REST calls (NEST.JS)

Annotations are for the swagger definition (the swagger component uses reflection)

*/


// REST controller
@ApiUseTags('management')
@Controller('management')
export class ManagementController {

  constructor(private readonly service: ManagementService) {
  }


  /******************************** SEND TEST MAIL ********************************************************/
  @ApiOperation({
    title: 'Send an e-mail to test mail server gateway',
    description: '',
    operationId: 'SendTestMail'
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: String
  })
  @Put('SendMail')
  sendTestMail(@Query('useKafka') useKafka: boolean, @Query() all: any, @Body() testMail: MailData): String | void {
    let mediaPost = {
      guid: uuidv4(),
      name: testMail.Subject,
      owner: '',
      mediumType: MediumTypes.MAIL,
      mediumName: '',
      header: testMail.Subject,
      intro: undefined,
      body: testMail.Content,
      // /** the base64 encoded media items attached to this post */
      /** Links to files attached to this post */
      files: undefined,
      visibleForParticipant: true,
      senderName: testMail.From,
      senderRole: undefined,
      recipients: testMail.To.split(','),
      date: (new Date).getTime(),
      location: undefined
    } as ISimulationEntityPost;
    if (useKafka === true) {
      this.service.provider.TestBedKafkaService.send(mediaPost);
    } else {
      this.service.provider.MailGatewayService.enqueueSimulationEntityPost(mediaPost);
    }
    return 'Test mail send';
  }
    /********************************  GET STATUS  ********************************************************/
    @ApiOperation({
      title: 'Get status',
      description: 'Get status of server',
      operationId: 'GetStatus',
    })
    @ApiResponse({
      status: 200,
      description: 'Returns the status of server',
      type: Statusresult,
    })
    @Get('GetStatus')
    async GetStatus(): Promise<Statusresult> {
      const status = await this.service.provider.GetStatus();
      const result: Statusresult = {
        StatusAsJson: JSON.stringify(status)
      };
      return result;
    }

  /********************************  GET MAIL ACOUNTS ********************************************************/
  @ApiOperation({
    title: 'Get mail accounts',
    description: 'Get mail accounts',
    operationId: 'MailAccounts',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the mail accounts',
    type: MailAccountsResultImpl,
  })
  @Get('MailAccounts')
  async GetMailAccounts(): Promise<MailAccountsResultImpl> {
    const acounts = await this.service.provider.PostfixService.mailAccounts();
    const result: MailAccountsResultImpl = {
      Accounts: acounts.filter(Boolean)
    };
    return result;
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
    type: AddMailAccountResultImpl,
  })
  @Post('AddMailAccount')
  async AddMailAccount(@Query('account') account: string, @Query('password') password: string): Promise<AddMailAccountResultImpl> {
    return this.service.provider.PostfixService.addAccount(account, password);
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
    type: DeleteMailAccountResultImpl,
  })
  @Post('DeleteMailAccount')
  async DeleteMailAccount(@Query('account') account: string): Promise<DeleteMailAccountResultImpl> {
    return this.service.provider.PostfixService.deleteMailAccount(account);
  }

  /*******************************************************************************************/
  @ApiOperation({
    title: 'Reset',
    description: 'Reset database',
    operationId: 'Reset',
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: ResetResultImpl,
  })
  @Post('Reset')
  async Reset(): Promise<ResetResultImpl> {
    this.service.provider.MailGatewayService.reset();
    const result: ResetResultImpl = {
       Msg: 'Cleared database'
    };
    return result;
  }
}
