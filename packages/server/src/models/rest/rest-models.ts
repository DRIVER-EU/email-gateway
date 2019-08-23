import { ApiModelProperty } from '@nestjs/swagger';

// This file is not generated and can be edited!

export class MailData {

    constructor(from: string, to: string, subject: string) {
        this.From = from;
        this.To = to;
        this.Subject = subject;
    }

    @ApiModelProperty({ required: true })
    public From: string;
    @ApiModelProperty({ required: true })
    public To: string;
    @ApiModelProperty({ required: true })
    public Subject: string;
}