import { MailGatewayProvider } from './mail-gateway-provider';
import { ManagementService } from './controllers/management.service';
import { Module } from '@nestjs/common';
import { ManagementController } from './controllers/management.controller';

// Inject into NEST.JS
export const ProviderDef = {
  provide: 'MailGatewayProvider',
  useFactory: () => {
    return new MailGatewayProvider();
  }
}


@Module({
  imports: [ ],
  controllers: [ManagementController],
  providers: [ManagementService, ProviderDef ],

})
export class AppModule {}
