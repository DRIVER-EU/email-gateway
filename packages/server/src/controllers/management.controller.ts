import { Controller, Get, Inject, Param, Req, Put, Body, Query, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiImplicitParam, ApiUseTags, ApiImplicitBody } from '@nestjs/swagger';
import { ManagementService } from './management.service';
import { MailData } from './../models/rest/rest-models';

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
  async sendTestMail(@Query('useKafka') useKafka: boolean, @Query() all: any, @Body(new ValidationPipe({transform: true})) testData: any ): Promise<String | void> {
    this.service.provider.MailGatewayService.
      return 'This route uses a wildcard';
  }
}
