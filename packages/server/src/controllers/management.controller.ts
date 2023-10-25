import { Controller, Get, Put, Body, Query, Post } from "@nestjs/common";
import { ApiResponse, ApiOperation, ApiTags, ApiQuery } from "@nestjs/swagger";
import { ManagementService } from "./management.service.js";
import {
  MailData,
  SimulationEntityPostData,
  Statusresult,
  MailAccountsResultImpl,
  AddMailAccountResultImpl,
  DeleteMailAccountResultImpl,
  ResetResultImpl,
} from "../models/rest/rest-models.js";
import { getErrorMessage } from "../helpers/exceptions.js";
import { IPost } from "../models/avro_generated/simulation_entity_post-value.js";
import { MailServerException } from "../nestjs_exceptions/MailServerException.js";
import * as uuidv4 from "uuid";

/*

Entrypoint for all management REST calls (NEST.JS)

Annotations are for the swagger definition (the swagger component uses reflection)

*/

// REST controller
@ApiTags("management")
@Controller("management")
export class ManagementController {
  constructor(private readonly service: ManagementService) {}
  /******************************** SEND TEST MAIL ********************************************************/
  @ApiOperation({
    summary: "Test JSON ISimulationEntityPost injection (direct or KAFKA)",
    description: "",
    operationId: "TestSimulationEntityPost",
  })
  @ApiResponse({
    status: 200,
    description: "",
    type: String,
  })
  @Put("TestSimulationEntityPost")
  testPost(
    @Query("useKafka") useKafka: boolean,
    @Body() testPost: SimulationEntityPostData
  ): String | void {
    try {
      this.service.provider.LogService.LogMessage(
        `REST Controller TestSimulationEntityPost POST; use KAFKA = ${useKafka}`
      );
      const mediaPost = JSON.parse(testPost.PostAsJson) as IPost;
      // TODO boolean is string ?!@
      if ((useKafka + "").toLowerCase() === "true") {
        this.service.provider.TestBedKafkaService.sendSimulationEntityPostToKafka(
          mediaPost
        );
      } else {
        this.service.provider.MailGatewayService.enqueueSimulationEntityPost(
          mediaPost
        );
      }
      return "{  }";
    } catch (error) {
      return '{ Error: "Error ' + error + '"}';
    }
  }

  /******************************** SEND TEST MAIL ********************************************************/
  @ApiOperation({
    summary: "Send an e-mail to test mail server gateway",
    description: "",
    operationId: "SendTestMail",
  })
  @ApiResponse({
    status: 200,
    description: "",
    type: String,
  })
  @Put("SendMail")
  sendTestMail(
    @Query("useKafka") useKafka: boolean,
    @Query() all: any,
    @Body() testMail: MailData
  ): String | void {
    let mediaPost = {
      id: uuidv4.v4(),
      body: testMail.Content,
      header: {
        from: testMail.From,
        to: testMail.To.split(","),
        cc: null,
        bcc: null,
        intro: undefined,
        subject: testMail.Subject,
        location: undefined,
        attachments: undefined,
      },
      name: testMail.Subject,
      type: "MAIL",
      owner: "",
      // /** the base64 encoded media items attached to this post */
      /** Links to files attached to this post */
      timestamp: new Date().getTime(),
      tags: undefined,
    } as IPost;
    if (useKafka === true) {
      this.service.provider.TestBedKafkaService.sendSimulationEntityPostToKafka(
        mediaPost
      );
    } else {
      this.service.provider.MailGatewayService.enqueueSimulationEntityPost(
        mediaPost
      );
    }
    return "Test mail send";
  }
  /********************************  GET STATUS  ********************************************************/
  @ApiOperation({
    summary: "Get status",
    description: "Get status of server",
    operationId: "GetStatus",
  })
  @ApiResponse({
    status: 200,
    description: "Returns the status of server",
    type: Statusresult,
  })
  @Get("GetStatus")
  async GetStatus(): Promise<Statusresult> {
    const status = await this.service.provider.GetStatus();
    const result: Statusresult = {
      StatusAsJson: JSON.stringify(status),
    };
    return result;
  }

  /********************************  GET MAIL ACOUNTS ********************************************************/
  @ApiOperation({
    summary: "Get mail accounts",
    description: "Get mail accounts",
    operationId: "MailAccounts",
  })
  @ApiResponse({
    status: 200,
    description: "Returns the mail accounts",
    type: MailAccountsResultImpl,
  })
  @Get("MailAccounts")
  async GetMailAccounts(): Promise<MailAccountsResultImpl> {
    try {
      const acounts = await this.service.provider.PostfixService.mailAccounts();
      const result: MailAccountsResultImpl = {
        Accounts: acounts.filter(Boolean),
      };
      return result;
    } catch (e) {
      throw new MailServerException(getErrorMessage(e));
    }
  }
  /*******************************************************************************************/
  @ApiOperation({
    summary: "Add mail account",
    description: 'Add mail account to mail server (e.g. "user@world.com") ',
    operationId: "AddAccount",
  })
  @ApiQuery({
    name: "account",
    description: "The mail account",
    required: true,
    type: String,
  })
  @ApiQuery({
    name: "password",
    description: "The mail account password",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "",
    type: AddMailAccountResultImpl,
  })
  @Post("AddMailAccount")
  async AddMailAccount(
    @Query("account") account: string,
    @Query("password") password: string
  ): Promise<AddMailAccountResultImpl> {
    return this.service.provider.PostfixService.addAccount(account, password);
  }

  /*******************************************************************************************/
  @ApiOperation({
    summary: "Delete mail account",
    description: 'Delete mail account to mail server "user@world.com" ',
    operationId: "DeleteAccount",
  })
  @ApiQuery({
    name: "account",
    description: "The mail account",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "",
    type: DeleteMailAccountResultImpl,
  })
  @Post("DeleteMailAccount")
  async DeleteMailAccount(
    @Query("account") account: string
  ): Promise<DeleteMailAccountResultImpl> {
    return this.service.provider.PostfixService.deleteMailAccount(account);
  }

  /*******************************************************************************************/
  @ApiOperation({
    summary: "Reset",
    description: "Reset database",
    operationId: "Reset",
  })
  @ApiResponse({
    status: 200,
    description: "",
    type: ResetResultImpl,
  })
  @Post("Reset")
  async Reset(): Promise<ResetResultImpl> {
    this.service.provider.MailGatewayService.reset();
    const result: ResetResultImpl = {
      Msg: "Cleared database",
    };
    return result;
  }
}
