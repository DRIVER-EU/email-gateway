import { ApiModelProperty } from '@nestjs/swagger';

export class MailAccountsResult {
    @ApiModelProperty({ required: true, isArray: true, type: String })
    public Accounts: string[];
}

// tslint:disable-next-line: max-classes-per-file
export class ChangePasswordMailAccountResult {
    @ApiModelProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class AddMailAccountResult {
    @ApiModelProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class DeleteMailAccountResult {
    @ApiModelProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class ResetResult {
    @ApiModelProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
// export class SetDateTimeResult {
//    @ApiModelProperty({ required: true, type: String })
//    public Msg: string;
// }
