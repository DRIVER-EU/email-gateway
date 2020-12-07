import { INotificationService, NotificationService } from './notification-service';


/*

Basic service for logging.

In the future logging must be specified to go to file, websocket, console, kafka

TODO Replace by Logging framework or improve
- add source filtering (only messages from ....)
- formatting

*/


export interface ILogService {
    setNotificationService(notificationService: INotificationService): void ;
    LogMessage(msg: string): void;
    LogErrorMessage(msg: string): void;
}

export class LogService implements ILogService {
    private notificationService?: NotificationService = undefined;

    constructor() {
    }

    public setNotificationService(notificationService: NotificationService) {
        this.notificationService = notificationService;
    }

    LogMessage(msg: string) {
        if (this.notificationService)  this.notificationService.sendLogMessage(this.getDateTimeAsString() + '  ' + msg);
        console.log(msg);
    }

    LogErrorMessage(msg: string) {
        if (this.notificationService) this.notificationService.sendLogMessage(this.getDateTimeAsString() + '  ' + 'ERROR: ' + msg);
        console.error(msg);
    }

    leftpad(val: number, resultLength = 2, leftpadChar = '0'): string {
        return (String(leftpadChar).repeat(resultLength)
              + String(val)).slice(String(val).length);
      }

    getDateTimeAsString(): string {
        const dt = new Date();
        return this.leftpad(dt.getHours(), 2)
                  + ':' + this.leftpad(dt.getMinutes(), 2)
                  + ':' + this.leftpad(dt.getSeconds(), 2);
      }
}

