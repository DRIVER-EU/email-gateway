import { Component, OnInit } from '@angular/core';
import { GatewayMailServerService } from './../gateway-mail-server.service';

@Component({
  selector: 'app-server-status',
  templateUrl: './server-status.component.html',
  styleUrls: ['./server-status.component.css']
})
export class ServerStatusComponent implements OnInit {
  showErrorMessage = false;
  errorMessage: string | undefined = undefined;
  status: any;
  constructor(private mailGatewayService: GatewayMailServerService) { }

  ngOnInit() {
    this.getServerStatus();
  }

  refresh() {
    this.getServerStatus();
  }
  async getServerStatus() {
    try {
      this.showErrorMessage = false;
      const result = await this.mailGatewayService.getServerStatus();
      this.status = JSON.parse(result.StatusAsJson);
    } catch (e) {
      this.showErrorMessage = true;
      this.status = undefined;
      this.errorMessage = e;
    }
  }
}
