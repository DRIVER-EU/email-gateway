import { ApiProperty } from "@nestjs/swagger";
import {
  AddMailAccountResult,
  MailAccountsResult,
  DeleteMailAccountResult,
  ResetResult,
} from "../../../swagger_codegenerator/generated_code/api.js";

// This file is not generated and can be edited!

export class SimulationEntityPostData {
  constructor(simulationEntityPostJson: string) {
    this.PostAsJson = simulationEntityPostJson;
  }
  @ApiProperty({ required: true })
  public PostAsJson: string;
}

export class MailData {
  constructor(from: string, to: string, subject: string, content: string) {
    this.From = from;
    this.To = to;
    this.Subject = subject;
    this.Content = content;
  }

  @ApiProperty({ required: true })
  public From: string;
  @ApiProperty({ required: true })
  public To: string;
  @ApiProperty({ required: true })
  public Subject: string;
  @ApiProperty({ required: true })
  public Content: string;
}

export class Statusresult {
  constructor(status: string) {
    this.StatusAsJson = status;
  }

  @ApiProperty({ required: true })
  public StatusAsJson: string;
}

export class MailAccountsResultImpl implements MailAccountsResult {
  @ApiProperty({ required: true, isArray: true, type: String })
  public Accounts: string[];
}

// tslint:disable-next-line: max-classes-per-file
export class AddMailAccountResultImpl implements AddMailAccountResult {
  @ApiProperty({ required: true, type: String })
  public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class DeleteMailAccountResultImpl implements DeleteMailAccountResult {
  @ApiProperty({ required: true, type: String })
  public Msg: string;
}

// tslint:disable-next-line: max-classes-per-file
export class ResetResultImpl implements ResetResult {
  @ApiProperty({ required: true, type: String })
  public Msg: string;
}
