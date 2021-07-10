import cors from 'cors';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
//import csrf from 'csurf';
import {getCurrentInvoke} from '@vendia/serverless-express';
import {Issuer} from 'openid-client';

import config from './config.json';

const app = express();
const router = express.Router();

const getCookies = (req) => {

    const rawCookies = req.headers.cookie?.slice(0, -1).split('; ');

    if (!rawCookies)
        return {};

    const parsedCookies = {};
    rawCookies.forEach(rawCookie => {
        const parsedCookie = rawCookie.split('=');
        parsedCookies[parsedCookie[0]] = parsedCookie[1];
    });

    return parsedCookies;
};

const sessionHandler = async (req, res, next) => {

    const {event} = getCurrentInvoke();
    console.log("EVENT " + JSON.stringify(event));
    console.log("REQ Headers" + JSON.stringify(req.headers));
    console.log("REQ Url" + JSON.stringify(req.url));

    const cookies = getCookies(req);

    console.log("SESSIONID " + JSON.stringify(cookies));

    if (!cookies[config.session.cookie.name]) {
        const url = (await client).authorizationUrl();

        return res.set({'WWW-Authenticate': `${config.unAuthorized.redirect.scheme} realm=${url}`})
            .status(config.unAuthorized.redirect.statusCode)
            .json({});
    }

    console.log("next");

    next();
}

router.use(cors());
router.use(bodyParser.json());

router.use(session({
    name: config.session.cookie.name,
    secret: config.session.cookie.secret,
    cookie: {
        path: config.session.cookie.path,
        httpOnly: config.session.cookie.httpOnly,
        secure: config.session.cookie.secure,
        maxAge: config.session.cookie.maxAge,
        sameSite: config.session.cookie.sameSite
    }
}));
//router.use(csrf({ cookie: true }));
router.use(sessionHandler);

const client = Issuer.discover(config.identityProvider.issuer.url)
    .then(cognitoIssuer => new cognitoIssuer.Client({
        client_id: config.identityProvider.app.clientId,
        client_secret: config.identityProvider.app.clientSecret,
        redirect_uris: [config.identityProvider.app.redirectUri],
        response_types: [config.identityProvider.app.responseType]
    }));

router.get('/api/callback', async (req, res) => {
    const {event} = getCurrentInvoke();

    console.log("EVENT CALLBACK " + JSON.stringify(event));

    const lclient = await client;
    const params = lclient.callbackParams(req);

    console.log("PARAMS " + JSON.stringify(params));

    const tokenSet = await lclient.callback(config.identityProvider.app.redirectUri, params);

    console.log("TOKENSET " + JSON.stringify(tokenSet));
});

app.use('/', router);

export default app;


// callback / logout
// proxy
// save in store
