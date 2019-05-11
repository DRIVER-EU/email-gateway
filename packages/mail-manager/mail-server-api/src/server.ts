
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Express } from 'express';
import { join } from 'path';
import { Inject } from '@nestjs/common';

var path = require('path');
var express = require('express');

export class Server {

  private server: NestExpressApplication;

  constructor() {
    console.log("Starting server");
    this.StartNestServerAsync()
      .then(server => {
        console.log("Server started");
      });

  }

  // Setup NEST.JS REST server
  async StartNestServerAsync(): Promise<NestExpressApplication> {
    // Create the server
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true /* enable preflight cors */ });
 
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
    SwaggerModule.setup('api', app, document); // http://<host>:<port>/api
    console.log(`'http://localhost:3000/api': OpenApi (swagger) documentation.`);
    console.log(`'http://localhost:3000/api-json': OpenApi (swagger) definition. `);

    // Start server
    await app.listen(3000);
    return app;
  }
}
