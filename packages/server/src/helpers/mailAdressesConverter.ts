
import { Address  } from 'nodemailer/lib/mailer';
import mailAddressesParser = require('nodemailer/lib/addressparser');

// Convert all email address formats to 1 format
export function mailAddressConverter(mailAddress?: string): Address[] {
    let addresses: Address[] = [];
    if (mailAddress) {
        mailAddressesParser(mailAddress).forEach(x => {
            // Convert from addressparser.Address to nodemailer/lib/mailer.Address
            const mailAddress: Address = {
                name: x.name,
                address: x.address
            };
            addresses.push(mailAddress);
        });
    }
    return addresses;
}