import {Session, SessionStore} from './session';

export class AWSDynamoDBSessionStore implements SessionStore {

  async destroy(sessionId: string): Promise<void> {
    return Promise.reject();
  }

  async get(sessionId: string): Promise<Session> {
    return Promise.reject();
  }

  async set(sessionId: string, session: Session): Promise<void> {
    return Promise.reject();
  }

  async touch(sessionId: string, session: Session): Promise<void> {
    return Promise.reject();
  }
}
