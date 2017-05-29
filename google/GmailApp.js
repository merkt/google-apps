import Google from 'googleapis';
import GmailMessage from './GmailMessage'

const Gmail = Google.gmail('v1');

export default class {
    constructor(authClient) {
        this.authClient = authClient;

        if (!authClient.getAuth)
            throw Error('authClient must have a getAuth method.');
    }

    search(query) {
        const _this = this;

        return new Promise((resolve, reject) => {
            _this.authClient.getAuth().then(auth => {
                Gmail.users.threads.list({
                    auth: auth,
                    userId: 'me',
                    q: query
                }, (err, response) => {
                    if (!err) {
                        resolve(response.threads);
                    } else {
                        reject(Error(err));
                    }
                })
            }).catch(err => {
                throw err;
            });
        });
    }

    getMessagesForThreads(threads) {
        return Promise.all(threads.map(thread => {
            this.getMessageForThread(thread);
        }));
    }

    getMessageForThread(thread) {
        const _this = this;

        return new Promise((resolve, reject) => {
            _this.authClient.getAuth().then(auth => {
                Gmail.users.messages.get({
                    auth: auth,
                    userId: 'me',
                    id: thread.id
                }, (err, message) => {
                    if (!err) {
                        resolve(new GmailMessage(_this.authClient, message));
                    } else {
                        reject(Error(err));
                    }
                });
            }).catch(err => {
                reject(Error(err));
            });
        });
    }
}