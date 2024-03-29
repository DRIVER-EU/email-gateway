
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Express } from 'express';
import { join } from 'path';
import { Inject } from '@nestjs/common';
import * as express from 'express';

// var path = require('path');
// var express = require('express');

// var fs = require('fs');
// var util = require('util');
import log4js = require('log4js');

const subpath = 'mailapi';

log4js.configure({
  appenders: { mailApi: { type: 'file', filename: 'mail_api.log' } },
  categories: { default: { appenders: ['mailApi'], level: 'info' } }
});

const logger = log4js.getLogger('mailApi');

export class Server {

  
  private server: NestExpressApplication;

  constructor() {

    this.StartNestServerAsync()
      // tslint:disable-next-line: no-empty
      .then(server => {
      });

  }

  // Setup NEST.JS REST server
  async StartNestServerAsync(): Promise<NestExpressApplication> {
    // Create the server
    const port = process.env.MailServerApiPort || 3000;

    logger.info(`API Mail Server REST interface started on port ${port}\${subpath}. ` );

    const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true /* enable preflight cors */ });
 	// Needed for proxy
	app.setGlobalPrefix(subpath);
	
    // app.useStaticAssets(join(__dirname, 'public'));
	app.use(`/${subpath}`, express.static(join(__dirname, 'public')));

    // Add response header to all incomming requests
    // Use express from this
    app.use((req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*'); // Disable CORS (not for production)
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    // Create swagger documentation
    const options = new DocumentBuilder()
      .setTitle('Mail server')
      .setDescription('Mailserver API description')
      .setVersion('1.0')
      .addTag('Mail server')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(`${subpath}/api`, app, document); // http://<host>:<port>/api
     console.log(`'http://localhost:${port}}/${subpath}/api': OpenApi (swagger) documentation.`);
     console.log(`'http://localhost:${port}}/${subpath}/api-json': OpenApi (swagger) definition. `);

    // Start server
   
    await app.listen(port);
    return app;
  }
}
