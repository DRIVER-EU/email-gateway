import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GatewayMailServerService } from './../gateway-mail-server.service';
import { SimulationEntityPostData } from './../../generated_rest_api/api';
import { HttpClient } from "@angular/common/http";
@Component({
  selector: 'app-send-simulation-entity-post',
  templateUrl: './send-simulation-entity-post.component.html',
  styleUrls: ['./send-simulation-entity-post.component.css']
})
export class SendSimulationEntityPostComponent implements OnInit {

  private id: string = 'GUID_' + new Date().getTime();
  public mailForm: FormGroup;
  useKafka = false;
  useEmbeddedAttachment = false;
  public post: any;
  largeFileServiceUrl = '';

  constructor(
    private http: HttpClient,
    private mailGatewayService: GatewayMailServerService,
    private formBuilder: FormBuilder) {
    this.mailForm = this.formBuilder.group({
      timestamp: new Date().toISOString().substring(0, 16),
      from: 'Mark Rutte<user435@demo.com>',
      to: 'jos@demo.com;Pietje Puk<user1223@driver.eu>',
      cc: '',
      bcc: '',
      subject: 'Subject here',
      content: 'Body here',
      attachmenturl: 'https://www.google.nl/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
      attachmentname: 'google.png',
    });
    this.updateJSON();
  }

  private imageBase64encoded;

  ngOnInit() {
     this.getLargeFileServiceUrl();
     // https://stackblitz.com/edit/angular-read-file-as-blob-cmtmbv?file=src/app/app.component.ts
     this.http
      .get('/assets/TNO_logo.jpg', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Remove data:image/<<type>>;base64,
          // this.imageBase64encoded = (reader.result as string).split(';base64,')[1]; // base64; remove prefix
          this.imageBase64encoded = (reader.result as string);
        };
        reader.onerror = () => {
          this.imageBase64encoded = btoa('Failed: ' + reader.error);
        };
        reader.readAsDataURL(res);
       
      });
  }

  // https://stackblitz.com/edit/angular-read-file-as-blob-cmtmbv?file=src/app/app.component.ts




  async getLargeFileServiceUrl() {
    try {
      const result = await this.mailGatewayService.getServerStatus();
      const status = JSON.parse(result.StatusAsJson);
      this.largeFileServiceUrl = status.server.largeFileServiceUrl;
    } catch (e) {

    }
  }

  createAttachmentUrl() {
    if (this.largeFileServiceUrl) {
      window.open( this.largeFileServiceUrl, '_blank');
    } else {
      alert('No large file service avaliable');
    }
  }

  updateJSON() {
    const dt = (this.mailForm.value.timestamp) ? Date.parse(this.mailForm.value.timestamp) : new Date().getTime();
    let at;
    if (this.useEmbeddedAttachment) {
      if (this.mailForm.value.attachmentname) {
        at = {
          ['tno.jpg']: this.imageBase64encoded,
          [(this.mailForm.value.attachmentname as string)]: this.mailForm.value.attachmenturl as string
        };
      } else {
        at = {
          ['tno.jpg']: this.imageBase64encoded
        };
      }
    } else {
      at = (this.mailForm.value.attachmentname) ?
      { [ this.mailForm.value.attachmentname as string]: (this.mailForm.value.attachmenturl as string) ?? '' }
       : undefined;
    }
    this.post /*: IPost*/ = {
      id: this.id,
      name: this.id,
      owner: '',
      type: 'MAIL',
      header: {
        from: this.mailForm.value.from,
        date: dt,
        to: this.mailForm.value.to ? (this.mailForm.value.to as string).split(';') : '',
        cc: this.mailForm.value.cc ? (this.mailForm.value.cc as string).split(';') : undefined,
        bcc: this.mailForm.value.bcc ? (this.mailForm.value.bcc as string).split(';') : undefined,
        subject: this.mailForm.value.subject,
        location: undefined,
        intro: undefined,
        attachments: at,
      },
      body: this.mailForm.value.content,
      timestamp: dt
    };
  }

  onSubmitMailForm(action: string) {
    this.updateJSON();
    this.id = 'GUID_' + new Date().getTime();
    const dta: SimulationEntityPostData = {
      PostAsJson: JSON.stringify(this.post)
    };
    this.mailGatewayService.testPost(dta, this.useKafka)
    .then(x => alert('Succesfully published to server'))
    .catch(e => {
      alert('Failed to publish to server ' + e);
    });
  }

  useEmbeddedAttachmentChanged(event) {
    this.updateJSON();
  }



}
