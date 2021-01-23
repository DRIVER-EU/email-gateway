# E-mail gateway
Exchange e-mail messages between e-mail server and KAFKA bus (ISimulationEntityPost)

* Running in a complete standalone docker environment (no connection with other mail servers)
* Runs out-of-the-box ((almost) no configuration)
* Uses fully compatible SMTP/IMAP server (postfix server)
* All domain names allowed for e-mail addresses
* E-mail address are created on the fly, no need to configure
* Attachments are supported (stored in Large File service)
* Build-in web-based mail application (RoundCube)
* Possible to use external mail applications like outlook, thunderbird
* Web based management portal to monitor mail server
* The timestamp of the mail message can be modified 

## Getting started

The entire service can run in docker containers.

To build the docker images locally (will be placed in dockerhub in the future):

`Run 'email-gateway\docker\mailserver\BuildAllDockerImages.bat'`

To run the service (will also start KAFKA, Large File Service etc.)

`* Run 'StartDockerContainers.bat'`

`* Open webbrowser on port 4200

## E-mail account management

E-mail accounts are created on the fly for all e-mail accounts used in 'simulation_entity_post' message. It is also possible to create e-mail accounts manual with the webmanagement tool. There is no KAFKA message to create e-mail accounts.  If the ID in 'simulation_entity_post' matches 'RESET_SCENARIO_REMOVE_ALL' all e-mail accounts are removed on the e-mail server.

## E-mail password

The password for all e-mail accounts is 'default'. 

For this release all passwords for all e-mail accounts are the same. It is possible to set a password for each e-mail account, but this is not implemented (only call to change password). The service must known all password.

## Overview

![Overview](documentation/Images/overview.png)

## Documentation

- [Server documentation](packages/server/ReadMe.md)
- [Mapping between KAFKA and MAIL server](documentation/Mapping.md)
- [Configuration](documentation/Configuration.md)
- [Sent folder](documentation/SentMailBox.md)

## Known limitations

* In the current situation all passwords for the mail accounts are the same. It is possible to provide each user his own password, but the service needs to known the password to check the outbox (sending messages to kafka)
* No addressbook in RoundCube
* When enabled, the monitor-website is accessible for everyone.
* There is no kafka messages for creating mail accounts (this is done when mail is send).



## Docker images

The docker-compose ' email-gateway\docker\mailserver\docker-compose.yml' starts a standalone local test environment. 

The following docker images are created by this project:

* driver-roundcube: Standard web-based e-mail client (roundcube.net)
* driver-mailserver: A postfix mail-server extended with an REST API to manage the server ( http://www.postfix.org/)
* driver-mailgateway: The e-mail gateway KAFKA <==> POSTFIX MAIL SERVER (NODE.JS )
* driver-mailmonitor: Web-based management tool to monitor the e-mail gateway

.