import { MailData } from './../../../swagger_codegenerator/generated_code/api';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GatewayMailServerService } from './../gateway-mail-server.service';

@Component({
  selector: 'app-send-test-mail',
  templateUrl: './send-test-mail.component.html',
  styleUrls: ['./send-test-mail.component.css']
})
export class SendTestMailComponent implements OnInit {
  mailForm;
  useKafka = false;
  constructor(
    private mailGatewayService: GatewayMailServerService,
    private formBuilder: FormBuilder) {
      this.mailForm = this.formBuilder.group({
        from:  '"Hein Kluiver 👻" <hein@demo.com>' ,
        to:  'jos@demo.com' ,
        subject: '',
        content: ''
      });
    }

  ngOnInit() {
  }

  onSubmit(formData) {
    const mail: MailData = {
      From: formData.from,
      To: formData.to,
      Subject: formData.subject,
      Content: formData.content
    };
    this.mailGatewayService.SendMail(mail, this.useKafka).catch(e => {
      console.log('error');
    });
    this.mailForm.reset();
  }

}
