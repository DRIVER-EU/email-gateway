import { Injectable, Inject, Scope } from '@nestjs/common';
import { MailGatewayProvider } from "./../mail-gateway-provider"
@Injectable({ scope: Scope.DEFAULT })
export class ManagementService {

    constructor(@Inject('MailGatewayProvider') private readonly provider: MailGatewayProvider) {
        
    }

}