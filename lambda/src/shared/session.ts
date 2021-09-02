import { CloudFrontRequest } from "aws-lambda";
import { Cookies } from "./cookies"

export type SessionConfiguration = {
    cookie: {
        name: string,
        path: string,
        httpOnly: boolean,
        secure: boolean,
        maxAge: number | undefined,
        sameSite: 'Strict' | 'Lax' | 'None'
    }
    secret: string,
    genid: (req: CloudFrontRequest) => string
};

export type Session = {

};

export async function getSessionFrom(cookies: Cookies, config: SessionConfiguration): Promise<Session> {

    return Promise.reject(`No session found for cookie ${config.cookie.name}, value: ${cookies[config.cookie.name]}`);
    //return cookies[config.cookie.name];
};


export class SessionStore {

    config: SessionConfiguration;

    constructor(config: SessionConfiguration) {
        this.config = config;
    }

    async get(_sessionId: string) {};

    async set(_sessionId: string, _session: Session) {};

    async destroy(_sessionId: string) {};

    async touch(_sessionId: string, _session: Session) {};
};