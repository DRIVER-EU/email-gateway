import { ApiProperty } from '@nestjs/swagger';

export class MailAccountsResult {
    @ApiProperty({ required: true, isArray: true, type: String })
    public Accounts: string[];
}

// tslint:disable-next-line: max-classes-per-file
export class ChangePasswordMailAccountResult {
    @ApiProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class AddMailAccountResult {
    @ApiProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class DeleteMailAccountResult {
    @ApiProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class ResetResult {
    @ApiProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
// export class SetDateTimeResult {
//    @ApiProperty({ required: true, type: String })
//    public Msg: string;
// }
