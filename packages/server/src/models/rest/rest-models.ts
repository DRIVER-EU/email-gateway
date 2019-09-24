import { ApiModelProperty } from '@nestjs/swagger';
import { AddMailAccountResult, MailAccountsResult, DeleteMailAccountResult, ResetResult } from './../../../swagger_codegenerator/generated_code/api';

// This file is not generated and can be edited!

export class MailData {

    constructor(from: string, to: string, subject: string, content: string) {
        this.From = from;
        this.To = to;
        this.Subject = subject;
        this.Content = content;
    }

    @ApiModelProperty({ required: true })
    public From: string;
    @ApiModelProperty({ required: true })
    public To: string;
    @ApiModelProperty({ required: true })
    public Subject: string;
    @ApiModelProperty({ required: true })
    public Content: string;
}


export class MailAccountsResultImpl implements MailAccountsResult {
    @ApiModelProperty({ required: true, isArray: true, type: String })
    public Accounts: string[];
}

// tslint:disable-next-line: max-classes-per-file
export class AddMailAccountResultImpl implements AddMailAccountResult {
    @ApiModelProperty({ required: true, type: String })
    public Msg: string;
}


// tslint:disable-next-line: max-classes-per-file
export class DeleteMailAccountResultImpl implements DeleteMailAccountResult {
    @ApiModelProperty({ required: true, type: String })
    public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class ResetResultImpl implements ResetResult {
    @ApiModelProperty({ required: true, type: String })
    public Msg: string;
}

