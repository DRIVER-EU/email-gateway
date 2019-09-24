### Mapping between e-mail and  SimulationEntityPost

The AVRO scheme can be found at: \sim\entity\simulation_entity_post-value.avsc

| AVRO        | E-MAIL                | COMMENT                                                  |
| ----------- | --------------------- | -------------------------------------------------------- |
| mediumType  |                       | Must always have value 'MAIL'                            |
| guid:       |                       | Used in logging to identify post                         |
| senderName  | From                  | Always one e-mail addresses                              |
| recipients  | To                    | One or more e-mail addresses (with ; as separator)       |
|             | Bcc                   | Not mapped                                               |
|             | Header: x-gateway-key | Always 'KAFKA'                                           |
| name        | Subject               |                                                          |
| body        | body                  | Can be HTML or plain text                                |
| date        | Time sent             | This is the time shown in e-mail                         |
| attachments |                       | Url links to the large file storage. Links must be valid |



## Format e-mail account

E-mail addresses must confirm to rfc2822.

Library http://https://github.com/nodemailer/nodemailer/blob/master/lib/addressparser/index.js

Example of valid e-mail address:

* Name <<address@domain>>
* address@domain
* Name <<address@domain>>;address1@domain