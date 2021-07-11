import cors from 'cors';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
//import csrf from 'csurf';
import {createProxyMiddleware} from "http-proxy-middleware";

import {Issuer} from 'openid-client';
import config from './config.json';
import {AWSDynamoDBStore} from './awsDynamoDBStore';

const app = express();
const router = express.Router();

const getCookies = (req) => {

    console.log("GET COOKIES");

    const rawCookies = req.headers.cookie?.slice(0, -1)?.split('; ');

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

    const cookies = getCookies(req);

    console.log("COOKIES " + JSON.stringify(cookies));

    if (!cookies[config.session.cookie.name]) {
        const url = (await client).authorizationUrl();

        req.session.referer = req.headers['x-spa-referer'] || req.headers['referrer'] || req.headers['referer'];

        return res.set({'WWW-Authenticate': `${config.unAuthorized.redirect.scheme} realm=${url}`})
            .status(401)
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
    store: new AWSDynamoDBStore({aws: {region: 'us-east-1'}}),
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

router.get('/oauth2/callback', async (req, res) => {

    const lclient = await client;
    const params = lclient.callbackParams(req);

    console.log("PARAMS " + JSON.stringify(params));

    if (!params.code) {
        return res.status(500)
            .json({message: 'Authorization code not found for callback request'});
    }

    const tokenSet = await lclient.callback(config.identityProvider.app.redirectUri, params);

    console.log("TOKENSET " + JSON.stringify(tokenSet));
});

router.use('/api', createProxyMiddleware({
    target: config.backend.proxy.url,
    changeOrigin: true,
    xfwd: false,
    headers: {
        'Authorization': 'Bearer toto'
    },

    onError: (err, req, res, target) => {
        console.log(err);
        res.writeHead(500, {
            'Content-Type': 'text/plain',
        });
        res.end('Something went wrong. And we are reporting a custom error message.');
    },

    onProxyReq: (proxyReq, req, res) => {
        console.log("toto proxy req");
        proxyReq.removeHeader('x-forwarded-proto');
        proxyReq.removeHeader('connection');
        console.log("proxy headers " + JSON.stringify(proxyReq.getHeaders()));
        console.log("proxy path " + proxyReq.path);
    },

    onProxyRes: (proxyRes, req, res) => {
        console.log("toto proxy reqs");
        delete proxyRes.headers['x-forwarded-proto'];
        delete proxyRes.headers['connection'];
        console.log("proxy headers " + JSON.stringify(proxyRes.headers));
        console.log("proxy url " + proxyRes.url);
    }
}));

app.use('/', router);

export default app;
