require ["envelope", "fileinto", "imap4flags"];
if allof
    (
header :contains "X-Place-In-Sent-Folder" "YES",
envelope "From" "templatemailaddress") {
    fileinto "Sent";
    setflag "\\seen";
}
