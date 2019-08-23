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

  constructor(
    private mailGatewayService: GatewayMailServerService,
    private formBuilder: FormBuilder) {
      this.mailForm = this.formBuilder.group({
        from: '',
        to: ''
      });
    }

  ngOnInit() {
  }

  onSubmit(formData) {
    const mail: MailData = {
      From: formData.from,
      To: formData.to,
      Subject: ''
    };
    this.mailGatewayService.SendMail(mail);
    this.mailForm.reset();
  }

}
