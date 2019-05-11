import { Controller, Get, Inject, Param, Req, Put, Body } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiImplicitParam, ApiUseTags, ApiImplicitBody } from '@nestjs/swagger';
import { ManagementService } from './management.service';

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
}
