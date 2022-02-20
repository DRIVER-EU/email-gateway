
import { Address } from 'nodemailer/lib/mailer';
import mailAddressesParser = require('nodemailer/lib/addressparser');

function isString(x: any): x is string {
    return typeof x === 'string';
}

// Check if x is Address interface
function isAddress(x: any): boolean {
    return x.hasOwnProperty('address');
}

// Array.isArray function
function isArray(x: any) {
    return !!x && x.constructor === Array;
}

export function mailAddressConverterSingle(mailAddress:  string | Address | undefined): Address | undefined {
    if (isString(mailAddress)) return mailAddressStringConverter(mailAddress)[0];
    return mailAddress;
}

// Convert to adress to string
export function mailAddressToString(mailAddress: Address |  undefined) {
    if (!mailAddress) return '';
    return (mailAddress.name) ? `${mailAddress.name} (${mailAddress.address})` : `${mailAddress.address}`;
}

// Convert to adress to string
export function mailAddressConverterSingleToString(mailAddress:  string | Address | undefined): string {
    const address = mailAddressConverterSingle(mailAddress);
    return mailAddressToString(address);
}

export function mailAddressConverterToString(to: string | Address | Array<string | Address> | undefined): string {
    if (!to) return '';
    const addresses = mailAddressConverter(to);
    return addresses.map(o => mailAddressToString(o)).join(', ');
}

// Convert all email address formats to 1 type
export function mailAddressConverter(mailAddress:  string | Address | Array<string | Address>): Address[] {
    if (mailAddress) {
        if (isArray(mailAddress)) {
            let addresses: Address[] = [];
            let list = <Array<string | Address>>mailAddress;
            list.forEach(item => addresses.push(...mailAddressConverter(item)));
            return addresses;
        }
        if (isString(mailAddress)) return mailAddressStringConverter(mailAddress);
        if (isAddress(mailAddress)) return [ mailAddress as Address ];
    }
    return [];
}

export function convertAddress(x: mailAddressesParser.AddressOrGroup): string {
    if (isAddress(x)) return (x as Address).address;
    let grp = (x as mailAddressesParser.Group).group;
    return convertAddress(grp[0]); // todo loop over all groups
}

export function mailAddressStringConverter(mailAddress:  string): Address[] {
    let addresses: Address[] = [];
    if (mailAddress) {
        mailAddressesParser(mailAddress).forEach(x => {
            // Convert from addressparser.Address to nodemailer/lib/mailer.Address
            const mailAddress: Address = {
                name: x.name,
                address: convertAddress(x)
            };
            addresses.push(mailAddress);
        });
    }
    return addresses;
}

