import Google from 'googleapis';
import User from '../models/User';

const OAuth2 = Google.auth.OAuth2;

export default class {
    // TODO: Remove unused user
    constructor(user, tokens) {
        this.tokens = tokens;
        this.user = user;
        this._auth = new OAuth2(
            process.env.GOOGLE_ID,
            process.env.GOOGLE_SECRET
        );
        this._auth.setCredentials(tokens);
    }

    async getAuth() {
        const _this = this;
        const now = new Date();

        return new Promise((resolve, reject) => {
            if (!_this.tokens.expiry_date || now >= _this.tokens.expiry_date) {
                _this._auth.refreshAccessToken(async (err, tokens) => {
                    if (err) {
                        reject(Error(err));
                        return;
                    }

                    _this.tokens = tokens;
                    const expiryDate = new Date((new Date()).getTime() + (1000 * 60 * 60 * 24 * 7));

                    _this.user.claims = [
                        { type: 'urn:google:access_token', value: tokens.access_token },
                        { type: 'urn:google:refresh_token', value: tokens.refresh_token },
                        { type: 'urn:google:expiry', value:  expiryDate.toISOString() }
                    ];

                    User.update({ email: _this.user.email }, { claims: _this.user.claims}).exec();

                    resolve(_this._auth, null);
                });
            } else {
                resolve(_this._auth);
            }
        });
    }
}    