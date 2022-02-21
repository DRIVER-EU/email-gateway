import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GatewayMailServerService } from './../gateway-mail-server.service';
import { environment } from 'src/environments/environment';
import { getErrorMessage } from './../exception-handling';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  isInErrorState = false;
  isLoading = true;
  errorMessage: string | undefined = undefined;
  mailAccounts: string[];
  addAccountForm: FormGroup;

  constructor(private mailGatewayService: GatewayMailServerService,
              private formBuilder: FormBuilder) {
    this.addAccountForm = this.formBuilder.group({
      accountName: 'test@demo.com',
      password: 'default'
    });
  }

  ngOnInit() {
    this.getMailAccounts().catch(e => { });
  }
  onSubmit(formData) {
    this.mailGatewayService.addAccount(formData.accountName, 'default')
      .then(x => {
        alert(`Mail account ${formData.accountName} added.`);
        this.getMailAccounts().catch(e => { });
      }).catch(e => {
        alert('error:' + e);
      });
    this.addAccountForm.reset();
  }

  async getMailAccounts() {
    try {
      this.isLoading = true;
      const accounts = await this.mailGatewayService.getAccounts();
      this.mailAccounts = accounts.Accounts;
      this.isInErrorState = false;

    } catch (e) {

      this.isInErrorState = true;
      this.mailAccounts = [];
      this.errorMessage = getErrorMessage(e);

    }
    this.isLoading = false;
  }

  deleteAccount(accountName: string) {
    this.mailGatewayService.deleteAccount(accountName)
      .then(x => {
        alert(`E-mail account ${accountName} removed.`);
        this.getMailAccounts().catch(e => { });
      })
      .catch(error => alert(`Failed to remove ${accountName} (${error}).`));
  }

  openAccount(accountName: string) {
    const hostname = window.location.host;
    window.open(`http://${hostname}/webmail/?_user=${accountName}`, '_blank');
  }
  reset() {
    this.mailGatewayService.reset()
      .then(x => {
        alert(`Database reset`);
        this.getMailAccounts().catch(e => { });
      })
      .catch(error => alert(`Failed  (${error}).`));
  }

}

