import {CloudFrontRequest} from 'aws-lambda';
import {Cookies} from './cookies';

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
  genid: (req: CloudFrontRequest) => string,
  store: SessionStore
};

export class Session {

  config: SessionConfiguration;

  constructor(config: SessionConfiguration) {
    this.config = config;
  }

}


export interface SessionStore {

  get(sessionId: string): Promise<Session>;

  set(sessionId: string, session: Session): Promise<void>;

  destroy(sessionId: string): Promise<void>;

  touch(sessionId: string, session: Session): Promise<void>;
}

export async function getSessionFrom(cookies: Cookies, config: SessionConfiguration): Promise<Session> {

  return Promise.reject(`No session found for cookie ${config.cookie.name}, value: ${cookies[config.cookie.name]}`);
  //return cookies[config.cookie.name];
}
