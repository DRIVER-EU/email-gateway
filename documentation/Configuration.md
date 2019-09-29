# Configuration

Hardcoded (default) values are used if there is no configuration file found.  By default the configuration file is 'gateway-config.json' . The configuration file can be changed with the command line option '-c'. Variables can be overwritten with environment variables (used by docker).

In the webbrowser monitor website the active configuration can be viewed in the 'status' tab.

## Commandline options

| Option | Description               |
| :----- | ------------------------- |
| -c     | Change configuration file |
| -h     | Show help                 |



## Environment variables

Default value => The values when developing, overwritten in docker environment file.

| Variable                         | Default value                | Description                               |
| -------------------------------- | ---------------------------- | ----------------------------------------- |
| server_port                      | 7891                         | REST API interface port                   |
| server_WebsocketNotificationPort | 9996                         | Websocket notifications                   |
| LargeFileServiceUrl              | http://localhost:9090/upload | URL to Large File Service                 |
| ApiMailServerUrl                 | http://localhost:3000        | URL to REST API mailserver                |
| kafka_connectToKafka             | true                         | Connect to KAFKA server                   |
| kafka_autoRegisterSchemas        | true                         | Register AVRO schema's on startup         |
| kafka_kafkaHost                  | localhost:3501               | The KAFKA server                          |
| kafka_schemaRegistryUrl          | localhost:3502               | The KAFKA registry                        |
| kafka_clientid                   | MailGatewayService           | Client name under KAFKA                   |
| kafka_mediaTopicName             | Media                        | The topicname on KAFKA with POST messages |
| SmtpHost                         | localhost                    |                                           |
| SmtpPort                         | 25                           |                                           |
| IMapHost                         | localhost                    |                                           |
| IMapPort                         | 993                          |                                           |

All configuration logic is implemented in 'config-service.ts' 
