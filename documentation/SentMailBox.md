# Send mailbox

## Problem

When the gateway uses nodemailer to send mails in name of a e-mail account there is not copy of the e-mail placed in the 'verzonden' folder of the from e-mail account. When roundcube is used, this is done by the webclient.

## Explanation

When you send a mail using a regular mail client, such as Thunderbird, it will send the mail to your SMTP server, which then relays the message to the receiving mail server (also via SMTP). The copy in your sent folder, however, is additionally saved on your mail server via IMAP. So your mail is actually send twice, once to the receivers mail server, and a copy is "send" to your own mail server.

When using nodemailer you only provide the credentials for your SMTP server, so the mail is only send without storing a copy in your sent directory. So this is basically working as intended.

I can think of two ways to save a copy of the mail in the sent directory:

1. Use an additional library, such as `node-imap` to imitate the behavior of a regular mail client and manually save a copy of the mail (e.g., `node-imap` has an `append` method to save new mails).
2. Add your own mail address as BCC to all outgoing mails and use some type of server side filtering to automatically move them to the sent folder. This is computationally less expensive for your application, but has the additional filtering requirement for the mail server.

## Solution 

When the e-mail account is created, a sieve rule is added to the private mailbox. The sieve rule checks is the header 'place-in-sent-folder' is present and the 'from' matches the e-mail account. See 'packages\mail-manager\mail-server-api\mailserver\addmailuserandsieve'. The sieve rule file is placed in '/var/mail/<domain>/<user>/.dovecot.sieve'. This is automatically compiled to '.dovecot.svbin'.

The '/usr/lib/dovecot/sieve-global/before/' can be used for global sieve rules

https://github.com/docker-mailserver/docker-mailserver/wiki/Configure-Sieve-filters

To test the rule: https://www.fastmail.com/cgi-bin/sievetest.pl

| Name                             | Location                                         |
| -------------------------------- | ------------------------------------------------ |
| Configuration                    | /etc/dovecot/conf.d/90-sieve.conf                |
| Error logging sieve              | /var/mail/<domain>/<username>/.dovecot.sieve.log |
| Create e-mail account with sieve | /usr/local/bin/addmailuserandsieve               |

 

