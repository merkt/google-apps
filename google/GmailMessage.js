import Google from 'googleapis';
import GmailMessageAttachment from './GmailMessageAttachment'

const Gmail = Google.gmail('v1');

export default class {
    constructor(authClient, message) {
        this.authClient = authClient;
        this.message = message;

        if (!authClient.getAuth)
            throw Error('authClient must have a getAuth method.');
    }

    getAttachments() {
        const _this = this;
        const parts = this.message.payload.parts;

        return Promise.all(parts.reduce((result, part) => {
            if (part.filename && part.filename.length > 0) {
                result.push(_this.getAttachment(part.body.attachmentId, part));
            }
            return result;
        }, []));
    }

    getAttachment(id, part) {
        const _this = this;

        if (!part.filename || part.filename.length == 0) {
            return Promise.reject(Error('Argument "part" is an invalid attachment'));
        }

        return new Promise(async (resolve, reject) => {
            _this.authClient.getAuth().then(auth => {
                Gmail.users.messages.attachments.get({
                    auth: auth,
                    id: id,
                    messageId: _this.message.id,
                    userId: 'me'
                }, (err, attachment) => {
                    resolve(new GmailMessageAttachment(
                        _this.authClient, 
                        part.filename, 
                        part.mimeType, 
                        attachment
                    ));
                });
            }).catch(err => {
                reject(err);
            });
        });
    }
}