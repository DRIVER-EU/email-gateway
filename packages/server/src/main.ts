
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';


// Services
import { ILogService, LogService } from './services/log-service';
import { NestExpressApplication } from '@nestjs/platform-express';

import { join } from 'path';
import { Inject } from '@nestjs/common';
import { MailGatewayProvider } from './mail-gateway-provider';
let path = require('path');
let express = require('express');

/* Mail Gateway Server

Creates the webserver NEST.JS (uses express under the hood) and
 - Creates the provider (the providers hosts all services)
 - Disable CORS (all hostst allowed)
 - Creates a static puplic share on webserver
 - Create swagger documentation (entrypoint on websever)
 */
export class MailGatewayServer {

  private server: NestExpressApplication;
  private provider: MailGatewayProvider;

  constructor() {
    const logService = new LogService();
    // provider.GetTestBedKafkaService().GenerateTestMessages();
    this.StartNestServerAsync()
      .then(server => {
        this.provider = server.get(MailGatewayProvider); // Injection cannot be done in constructor

      });
  }

  // Setup NEST.JS REST server
  async StartNestServerAsync(): Promise<NestExpressApplication> {
    // Create the server
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true /* enable preflight cors */ });
    const configService = app.get(MailGatewayProvider).ConfigService;

    // Add response header to all incoming requests
    // Use express from this
    app.use((req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*'); // Disable CORS (not for production)
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
/*
    NEST.JS also supports CORS:
    const corsOptions = {
      "origin": "*",
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      "optionsSuccessStatus": 204,

    }
    app.enableCors(corsOptions); // Allows all clients
*/

    // Serve the public folder directory
    const publicDirectory: string = path.join(process.cwd(), 'public');
    // const publicDirectory = join(__dirname, '..', 'public');

    app.use('/public', express.static(publicDirectory));
    console.log(`'http://localhost:${configService.NestServerPortNumber}/public': Host files from '${publicDirectory}'`);

    // Create swagger documentation
     const options = new DocumentBuilder()
      .setTitle('Mail server gateway')
      .setDescription('Mail server')
      .setVersion('1.0')
      .addTag('Mail Server Gateway')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document); // http://<host>:<port>/api
    console.log(`'http://localhost:${configService.NestServerPortNumber}/api': OpenApi (swagger) documentation.`);
    console.log(`'http://localhost:${configService.NestServerPortNumber}/api-json': OpenApi (swagger) definition. `);


    // Start server
    await app.listen(configService.NestServerPortNumber);
    return app;
  }
}
