# E-Mail gateway server

The e-mail gateway is a NODE.JS application that bridges from the KAFA BUS and IMAP Mail Server. The server has an REST interface to manage and monitor the server.



[Setup development environment](Documentation/Development.md)

## E-mail server 

The docker image 'tvial/docker-mailserver' is used a base docker image (<https://hub.docker.com/r/tvial/docker-mailserver/>) . The docker images runs the postfix mailserver implementation (<http://www.postfix.org/>). E-mail accounts can be created, deleted and listed with an shell scripts. The project "\packages\mail-manager\mail-server-api' is a NODE.JS application with a REST server interface (NEST.JS).  With this REST interface the e-mail accounts can be managed remote. The API documentation is available on http://localhost:3000/api and the OpenApi definition at http://localhost:3000/api-json (when server is running). The project contains a docker file to create a docker image that wraps all. Since the REST server execute shell scripts from the mail-server container, the application must always run in docker. 

The e-mail server is completely standalone and will NOT send or receive mail from other mail-servers. The e-mail server doesn't restrict the new e-mail account to a domain (e.g. user@company.nl, beheer@waterschap.nl can be added).  