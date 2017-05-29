export default class {
    constructor(authClient, filename, mimeType, attachment) {
        this.authClient = authClient;
        this.filename = filename;
        this.mimeType = mimeType;
        this.id = attachment.attachmentId;
        this.data = attachment.data;
        this.size = attachment.size;
    }
}