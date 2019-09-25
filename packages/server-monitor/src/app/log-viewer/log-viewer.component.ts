import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.css']
})
export class LogViewerComponent implements OnInit {


  public messages: string[] = [];

  constructor(private notificationService: NotificationService) {

  }

  ngOnInit() {
     this.notificationService.onLogMessage().subscribe((message: string) => {
       debugger;
      //this.messages.unshift(message);
      this.messages.push(message);
     });
  }




}
