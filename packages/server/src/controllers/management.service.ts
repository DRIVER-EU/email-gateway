import { Injectable, Inject, Scope } from "@nestjs/common";
import { MailGatewayProvider } from "../mail-gateway-provider.js";
@Injectable({ scope: Scope.DEFAULT })
export class ManagementService {
  constructor(
    @Inject("MailGatewayProvider") public readonly provider: MailGatewayProvider
  ) {}
}
