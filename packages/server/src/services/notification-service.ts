import { WebSocketGateway } from "@nestjs/websockets";
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";

export interface INotificationService {
  sendLogMessage(text: string): void;
}

// TODO get server port from config
@WebSocketGateway(9996, {
  cors: {
    origin: "*",
  },
})
export class NotificationService
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  wsClients: any[] = [];

  constructor() {
    // Because of injection no params can be passed
    console.log("Notification service started on port 9996");
  }

  afterInit() {}

  handleConnection(client: any) {
    console.log(`New connection client ID: ${client.id}`);
    this.wsClients.push(client);
    this.BroadcastText("logmessage", `Client ID connected: ${client.id}`);
  }

  private Broadcast(event: any, message: any) {
    const broadCastMessage = JSON.stringify(message);
    for (let c of this.wsClients) {
      (c as any).emit(event, broadCastMessage);
    }
  }

  private BroadcastText(event: any, message: any) {
    for (let c of this.wsClients) {
      (c as any).emit(event, message);
    }
  }

  handleDisconnect(client: any) {
    for (let i = 0; i < this.wsClients.length; i++) {
      if (this.wsClients[i] === client) {
        this.wsClients.splice(i, 1);
        break;
      }
    }
  }

  public sendLogMessage(text: string) {
    this.BroadcastText("logmessage", text);
  }
}
