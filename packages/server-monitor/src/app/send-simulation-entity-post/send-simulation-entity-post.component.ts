import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GatewayMailServerService } from './../gateway-mail-server.service';
import { SimulationEntityPostData } from './../../generated_rest_api/api';
@Component({
  selector: 'app-send-simulation-entity-post',
  templateUrl: './send-simulation-entity-post.component.html',
  styleUrls: ['./send-simulation-entity-post.component.css']
})
export class SendSimulationEntityPostComponent implements OnInit {

  private guid: string = 'GUID_' + new Date().getTime();
  private mailForm: FormGroup;
  useKafka = false;
  private post: any;
   

  constructor(
    private mailGatewayService: GatewayMailServerService,
    private formBuilder: FormBuilder) {
    this.mailForm = this.formBuilder.group({
      timestamp: new Date().toISOString().substring(0, 16),
      from: '"Hein Kluiver " <hein@demo.com>',
      to: 'jos@demo.com',
      subject: 'Subject here',
      content: 'Body here',
      attachment: ''
    });
    this.updateJSON();
  }

  ngOnInit() {
   
  }

  updateJSON() {
    const dt = (this.mailForm.value.timestamp) ? Date.parse(this.mailForm.value.timestamp) : new Date().getTime();
    const at = (this.mailForm.value.attachment) ? [ this.mailForm.value.attachment ] : undefined;
    this.post /*: ISimulationEntityPost*/ = {
      guid: this.guid,
      name: this.mailForm.value.subject,
      owner: '',
      mediumType: 'MAIL',
      mediumName: '',
      senderName: this.mailForm.value.from,
      recipients: this.mailForm.value.to.split(/[,;\s]+/),
      visibleForParticipant: true,
      date: dt,
      location: undefined,
      body: this.mailForm.value.content,
      files: at
    };
  }

  onSubmitMailForm(action: string) {
    this.updateJSON();
    this.guid = 'GUID_' + new Date().getTime();
    const dta: SimulationEntityPostData = {
      PostAsJson: JSON.stringify(this.post)
    }
    debugger;
    this.mailGatewayService.testPost(dta, this.useKafka)
    .then(x => alert('Succesfully published to server'))
    .catch(e => {
      alert('Failed to publish to server ' + e);
    });
  }



}
