import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private socket: Socket) {

  }


  onLogMessage() {
    return this.socket.fromEvent('logmessage');
  }

}
