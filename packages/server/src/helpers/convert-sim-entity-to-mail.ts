// Convert ISimulationEntityPost to MailEnvelop (used by NodeMailer)

import { SendMailOptions as MailEnvelop } from "nodemailer";
import { Address, Attachment } from "nodemailer/lib/mailer";
import { uuid4 } from "node-test-bed-adapter";
import { IPost } from "../models/avro_generated/simulation_entity_post-value.js";

import { downloadFile } from "../helpers/download.js";
import { mailAddressConverter } from "../helpers/mailAdressesConverter.js";

// Services:
import { IConfigService } from "../services/config-service.js";
import { ILogService } from "../services/log-service.js";

// import { uploadFileToLargeFileService } from "./../helpers/upload.js";

import validUrl from "valid-url";
import FileSystem from "fs";
import Util from "util";
import Path from "path";
import btoa from "btoa";
import { cwd } from "node:process";

const writeFileAsync = Util.promisify(FileSystem.writeFile);

export class ConvertSimEntityToMail {
  private attachments: Attachment[] = new Array();

  constructor(
    private logService: ILogService,
    private configService: IConfigService,
    private mailEntity: IPost
  ) {}

  private validateThrowIfInvalid() {
    if (this.mailEntity.type?.toLocaleLowerCase() !== "mail")
      throw new Error("No mail type set in ISimulationEntityPost");
    if (!this.mailEntity.header)
      throw new Error("No header set in ISimulationEntityPost");
    if (
      !this.mailEntity.header.from ||
      this.mailEntity.header.from.length === 0
    )
      throw new Error("No from-field set in ISimulationEntityPost");
    if (!this.mailEntity.header.to || this.mailEntity.header.to.length === 0)
      throw new Error("No to-field set in ISimulationEntityPost");
    // if ((this.mailEntity.files) && this.mailEntity.files.some(x => !validUrl.isUri(x)))
    //    throw new Error('Not all files are valid URLs in ISimulationEntityPost');
  }

  private isEmpty(text: string): boolean {
    return !text || text.length === 0;
  }

  // The nodemailer also download the file, used to check if attachment is aval (or else nodemailer throws error)
  public async downloadAttachments() {
    if (this.mailEntity.header?.attachments) {
      const downloadFolder = this.getDownloadFolder();
      let filenames = new Array();
      /* Not async possible Object.entries(this.mailEntity.header.attachments).forEach(
                ([key, value]) => {
                    filenames.push(value);
                    console.log(key, value);
                } ); */
      let index = 0;
      for (let attachmentKey in this.mailEntity.header.attachments) {
        try {
          let filename = attachmentKey ?? "";
          let content = this.mailEntity.header.attachments[attachmentKey] ?? "";

          if (validUrl.isWebUri(content)) {
            if (this.isEmpty(filename)) {
              const name = this.urlToFilename(content);
              filename = new Date().getTime() + "_" + name;
            }
            const fullFileName = Path.resolve(downloadFolder, filename);
            try {
              const response = await downloadFile(content, fullFileName);
              this.logService.LogMessage(
                `Mail '${this.mailEntity.id}': downloaded attachment (location: ${fullFileName}) `
              );
              // // Use this if nodemailer must download file, nodemailer will fail is attachment is not downloadable: this.attachments.push(this.ConvertFileToAttachementUrl(content));
              const attachment = this.createFileAttachement(
                fullFileName,
                filename
              );
              this.attachments.push(attachment);
            } catch (downloadError) {
              this.logService.LogErrorMessage(
                `Mail '${this.mailEntity.id}': failed to downloaded attachment ${content} `
              );
              const attachment = this.createTextAttachement(
                `Error_${new Date().getTime()}.txt`,
                `Failed to download ${content}.`
              );
              this.attachments.push(attachment);
            }
          } else {
            try {
              // https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
              // const isBase64Encoded = this.isBase64(content);
              // const decodedContent = isBase64Encoded ? Buffer.from(content, 'base64').toString('binary') : content;

              // validUrl.isUri(content) work for data:image/<<type>>;base64,
              // Remove data:image/<<type>>;base64,
              const splitContent = content.split(";base64,");
              const contentBase64 =
                splitContent.length === 2 ? splitContent[1] : content;

              if (this.isEmpty(filename)) {
                filename = new Date().getTime() + "_noname.txt";
              }
              const fullFileName = Path.resolve(downloadFolder, filename);
              //await writeFileAsync(fullFileName, decodedContent /*, 'base64'*/);
              await writeFileAsync(fullFileName, contentBase64, "base64");
              this.logService.LogMessage(
                `Mail '${this.mailEntity.id}': saved attachment (location: ${fullFileName}) `
              );
              this.attachments.push(
                this.createFileAttachement(fullFileName, filename)
              );
              // Place in large file storage (not  needed)
              // try {
              //   const response = await uploadFileToLargeFileService(this.configService.LargFileServiceUrl, saveFile, true);
              //   const responseJson = JSON.parse(response.body);
              //   this.attachments.push(this.createUrlAttachement(responseJson.FileURL, filename));
              // } catch(e) {
              // }
            } catch (error) {
              this.logService.LogErrorMessage(
                `Mail '${this.mailEntity.id}': failed to save attachment `
              );
              const attachment = this.createTextAttachement(
                `Error_${new Date().getTime()}.txt`,
                `Failed to save content`
              );
            }
          }
        } catch (ex) {
          this.logService.LogErrorMessage("Failed to download" + ex);
        }
        index++;
      }
    }
  }

  private isBase64(base64Content: string): boolean {
    if (base64Content === "" || base64Content.trim() === "") {
      return false;
    }
    try {
      // return btoa(atob(content)) === content;

      // Qucik an dirty method to check if base64
      // Buffer method throw exception when not base64

      // Decode
      const base64Decoded = Buffer.from(base64Content, "base64").toString();

      // Encode
      const buf = Buffer.from(base64Decoded);
      const base64Encodes = this.base64RemovePadding(buf.toString("base64"));
      return true;

      // return base64Content === base64Encodes;
    } catch (err) {
      return false;
    }
  }

  private base64AddPadding(str: string) {
    return str + Array(((4 - (str.length % 4)) % 4) + 1).join("=");
  }

  private base64RemovePadding(str: string) {
    return str.replace(/={1,2}$/, "");
  }

  public async GetMailMessage(): Promise<MailEnvelop> {
    this.validateThrowIfInvalid();
    await this.downloadAttachments();
    let message = {
      headers: {
        "x-gateway-key": "KAFKA",
        //'X-Spam-Flag': 'YES'
        "X-Place-In-Sent-Folder": "YES",
      },
      from: this.FromMailAccount()[0],

      // Comma separated list of recipients
      to: this.ToMailAccounts(),
      cc: this.CcMailAccounts(),
      bcc: [this.BccMailAccounts(), ...this.FromMailAccount()], // Add from to bcc for 'sent' folder

      // Subject of the message
      subject: this.Subject(),

      // plaintext body
      text: "",

      // HTML body
      html: this.Body(),

      date: this.Timestamp(),

      // An array of attachments
      attachments: this.GetAttachments(),
    } as MailEnvelop;
    return message;
  }
  private GetAttachments(): Attachment[] | null {
    return this.attachments;
  }

  // https://community.nodemailer.com/using-attachments/
  // Assume that all attachements are url to large file service.
  private ConvertFileToAttachementUrl(url: string): Attachment {
    // https://nodejs.org/api/url.html
    const filename = this.urlToFilename(url);
    const attachment: Attachment = {
      filename: filename,
      path: url,
    };
    return attachment;
  }

  private urlToFilename(url: string): string {
    const result = new URL(url);
    const pathname = result.pathname || "/" + uuid4();
    const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
    return filename;
  }

  private createUrlAttachement(url: string, name: string) {
    const attachment: Attachment = {
      filename: name,
      path: url,
    };
    return attachment;
  }

  private createFileAttachement(filename: string, name: string) {
    const attachment: Attachment = {
      filename: name,
      path: filename,
    };
    return attachment;
  }

  private createTextAttachement(name: string, content: string): Attachment {
    const attachment: Attachment = {
      filename: name,
      content: Buffer.from(btoa(content), "base64"),
      contentType: "text/plain",
      encoding: "base64",
    };
    return attachment;
  }

  public FromMailAccount(): Address[] {
    return mailAddressConverter(this.mailEntity.header?.from || "");
  }

  public ToMailAccounts(): Address[] {
    return this.mailEntity.header?.to
      ? mailAddressConverter(this.mailEntity.header.to || "")
      : [];
  }

  public CcMailAccounts(): Address[] {
    return this.mailEntity.header?.cc
      ? mailAddressConverter(this.mailEntity.header.cc || "")
      : [];
  }

  public BccMailAccounts(): Address[] {
    return this.mailEntity.header?.bcc
      ? mailAddressConverter(this.mailEntity.header.bcc || "")
      : [];
  }

  public Subject() {
    return this.mailEntity.header?.subject || "";
  }

  public Body() {
    return this.mailEntity.body;
  }

  // KAFKA used the epoch time is the number of milli seconds that have elapsed since January 1, 1970 (midnight UTC/GMT)
  public Timestamp(): Date {
    const testDate = new Date("2018-04-11T10:20:30Z");
    const testEpochTime = testDate.getTime(); /* use sec instead of msec */
    let testDate1 = new Date(testEpochTime); // The 0 there is the key, which sets the date to the epoch

    let d = new Date(
      this.mailEntity.header?.date || 0
    ); /* number mseconds since 1 jan 1970 */
    return d;
  }

  private getDownloadFolder(): string {
    const downloadFolder = Path.resolve(cwd(), "./../../download");
    if (!FileSystem.existsSync(downloadFolder)) {
      FileSystem.mkdirSync(downloadFolder);
    }
    return downloadFolder;
  }
}
