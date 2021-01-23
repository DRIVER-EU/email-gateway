require "fileinto";
require "imap4flags";
if header :contains "X-Place-In-Sent-Folder" "YES" {
    fileinto "Verzonden";
	setflag "\\seen";
}
