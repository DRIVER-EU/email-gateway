import { Module } from "@nestjs/common";
import { MailGatewayProvider } from "./mail-gateway-provider.js";
import { ManagementService } from "./controllers/management.service.js";
import { ManagementController } from "./controllers/management.controller.js";
import { NotificationService } from "./services/notification-service.js";

// Inject into NEST.JS
export const ProviderDef = {
  provide: "MailGatewayProvider",
  useFactory: () => {
    return new MailGatewayProvider();
  },
};

@Module({
  imports: [],
  controllers: [ManagementController],
  providers: [ManagementService, ProviderDef, NotificationService],
})
export class AppModule {}
