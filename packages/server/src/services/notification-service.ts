
import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Client, Server } from 'socket.io';

export interface INotificationService {
    sendLogMessage(text: string): void;
}

// @WebSocketGateway(3001, { namespace: 'notifications' })
@WebSocketGateway(9996)
export class NotificationService implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    @WebSocketServer()
    server: Server;

    wsClients: Client[] = [];

    constructor() {
        console.log('Notification service started on port 9996');
    }

    afterInit() {
    }

    handleConnection(client: Client) {
        console.log(`New connection client ID: ${client.id}`);
        this.wsClients.push(client);
    }

    private Broadcast(event: any, message: any) {
        const broadCastMessage = JSON.stringify(message);
        for (let c of this.wsClients) {
            (c as any).emit(event, broadCastMessage);
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
        this.Broadcast('logmessage', text);
    }


}