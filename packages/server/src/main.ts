import path from "path";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { MailGatewayProvider } from "./mail-gateway-provider.js";
import express from "express";
import { cwd } from "node:process";

const subpath = "mailgateway";

/* Mail Gateway Server

Creates the webserver NEST.JS (uses express under the hood) and
 - Creates the provider (the providers hosts all services)
 - Disable CORS (all hostst allowed)
 - Creates a static puplic share on webserver
 - Create swagger documentation (entrypoint on websever)
 */
export class MailGatewayServer {
  private provider: MailGatewayProvider;

  constructor() {
    this.StartNestServerAsync().then((server: NestExpressApplication) => {
      this.provider = server.get("MailGatewayProvider"); // Injection cannot be done in constructor
      this.provider.SetServer(server);
    });
  }

  // Setup NEST.JS REST server
  async StartNestServerAsync(): Promise<NestExpressApplication> {
    // Create the server
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true /* enable preflight cors */,
    });

    // Needed for proxy
    app.setGlobalPrefix(subpath);

    const configService = app.get("MailGatewayProvider").ConfigService;

    // Add response header to all incoming requests
    // Use express from this
    app.use((req: any, res: any, next: any) => {
      res.header("Access-Control-Allow-Origin", "*"); // Disable CORS (not for production)
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
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
    const publicDirectory: string = path.join(cwd(), "public");
    // const publicDirectory = join(cwd(), '..', 'public');

    app.use(`/${subpath}/public`, express.static(publicDirectory));
    console.log(
      `'http://localhost:${configService.NestServerPortNumber}/${subpath}/public': Host files from '${publicDirectory}'`
    );

    // Create swagger documentation
    const options = new DocumentBuilder()
      .setTitle("Mail server gateway")
      .setDescription("Mail server")
      .setVersion("1.0")
      .addTag("Mail Server Gateway")
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(`${subpath}/api`, app, document); // http://<host>:<port>/api
    console.log(
      `'http://localhost:${configService.NestServerPortNumber}/${subpath}/api': OpenApi (swagger) documentation.`
    );
    console.log(
      `'http://localhost:${configService.NestServerPortNumber}/${subpath}/api-json': OpenApi (swagger) definition. `
    );

    // Start server
    await app.listen(configService.NestServerPortNumber);
    return app;
  }
}
