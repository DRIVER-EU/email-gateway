import { ApiModelProperty } from "@nestjs/swagger";

export class MailAccountsResult {
    @ApiModelProperty({ required: true, isArray: true, type: String })
    public Accounts: String[];
 }

 
 export class AddMailAccountResult {

 }

  
 export class DeleteMailAccountResult {

}
