### Mapping between e-mail and  SimulationEntityPost

The AVRO scheme can be found at: \sim\entity\simulation_entity_post-value.avsc

| AVRO        | E-MAIL                | COMMENT                                                      |
| ----------- | --------------------- | ------------------------------------------------------------ |
| mediumType  |                       | Must always have value 'MAIL'                                |
| guid:       |                       | Used in logging to identify post. If the value is set  to 'RESET_SCENARIO_REMOVE_ALL' a reset on mail-server is done |
| senderName  | From                  | Always one e-mail addresses                                  |
| recipients  | To                    | One or more e-mail addresses (with ; as separator)           |
|             | Bcc                   | Not mapped                                                   |
|             | Header: x-gateway-key | Always 'KAFKA'                                               |
| name        | Subject               |                                                              |
| body        | body                  | Can be HTML or plain text                                    |
| date        | Time sent             | This is the time shown in e-mail. The AVRO schema uses epoch time!       |
| attachments |                       | Url links to the large file storage. When not a url, the content is handled as binary data (base64 encoded) |

## What is epoch time?
The Unix epoch (or Unix time or POSIX time or Unix timestamp) is the number of seconds that have elapsed since January 1, 1970 (midnight UTC/GMT), not counting leap seconds (in ISO 8601: 1970-01-01T00:00:00Z).
Important: seconds is used, not msec !! 

## Attachments

The Large File Service is used to share attachments:

* KAFKA => MAIL Server: The Simulation Entity Post has in the attachments section url to the attachment(s) . The gateway will download the content and place it in the mail attachment.

* MAILSERVER => KAFKA: The attachments in the e-mail are downloaded and placed in the Large File Service. The url is passed into the attachment section of Simulation Entity Post.

  When the attachment section of Simulation Entity Post is not an valid url, the content is handled as binary data (this make it possible e.g. to send small text messages). If the content is not base64, the gateway will convert the content to base64.

## Format e-mail account

E-mail addresses must confirm to rfc2822.

Library http://https://github.com/nodemailer/nodemailer/blob/master/lib/addressparser/index.js

Example of valid e-mail address:

* Name <<address@domain>>
* address@domain
* Name <<address@domain>>;address1@domain