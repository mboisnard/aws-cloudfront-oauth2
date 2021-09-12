import {CloudFrontRequest} from 'aws-lambda';
import {Cookies, extractRefererFrom} from './headers';

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

  private readonly config: SessionConfiguration;

  readonly id;
  readonly referer;

  accessToken: string | undefined;
  idToken: string | undefined;
  refreshToken: string | undefined;

  constructor(request: CloudFrontRequest, config: SessionConfiguration) {
    this.config = config;

    this.id = config.genid(request);
    this.referer = extractRefererFrom(request.headers);

    this.accessToken = '';
    this.idToken = '';
    this.refreshToken = '';
  }

  isExpired(): boolean {
    return false;
  }

  save(): Promise<Session> {
    return this.config.store.set(this.id, this);
  }

  update(): Promise<Session> {
    return this.config.store.touch(this.id, this);
  }

  delete(): Promise<void> {
    return this.config.store.destroy(this.id);
  }
}


export interface SessionStore {

  get(sessionId: string): Promise<Session>;

  set(sessionId: string, session: Session): Promise<Session>;

  destroy(sessionId: string): Promise<void>;

  touch(sessionId: string, session: Session): Promise<Session>;
}

export async function getSessionFrom(cookies: Cookies, config: SessionConfiguration): Promise<Session> {

  return Promise.reject(`No session found for cookie ${config.cookie.name}, value: ${cookies[config.cookie.name]}`);
  //return cookies[config.cookie.name];
}
