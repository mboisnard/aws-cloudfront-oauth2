import {Session, SessionStore} from './session';
import {DynamoDB} from 'aws-sdk';

export type AWSDynamoDBConfiguration = {
  aws: {
    region: string
  },
  db?: {
    prefix?: string,
    hashKey?: string,
    table?: string,
    createTableIfNotExist?: boolean,
    readCapacityUnits?: number,
    writeCapacityUnits?: number,
    ttl?: number
  }
};

export class AWSDynamoDBSessionStore implements SessionStore {

  private readonly prefix: string;
  private readonly hashKey: string;
  private readonly table: string;
  private readonly createTableIfNotExist: boolean;
  private readonly readCapacityUnits: number;
  private readonly writeCapacityUnits: number;
  private readonly ttl: number;
  private readonly dynamoClient: DynamoDB;

  constructor(config: AWSDynamoDBConfiguration) {
    this.prefix = config.db?.prefix || 'sess';
    this.hashKey = config.db?.hashKey || 'id';
    this.table = config.db?.table || 'sessions';
    this.createTableIfNotExist = config.db?.createTableIfNotExist || false;
    this.readCapacityUnits = config.db?.readCapacityUnits || 5;
    this.writeCapacityUnits = config.db?.writeCapacityUnits || 5;
    this.ttl = config.db?.ttl || 900; // ttl in seconds

    this.dynamoClient = new DynamoDB({region: config.aws.region});

    /*this.getFormattedSessionId = sessionId => `${this.prefix}:${sessionId}`;
    this.currentTimestamp = () => Math.floor(Date.now() / 1000);
    this.getExpiresValue = session => {
      const ttl = session.cookie.maxAge || this.ttl;
      return this.currentTimestamp() + ttl;
    };*/
  }

  async destroy(sessionId: string): Promise<void> {
    return Promise.reject();
  }

  async get(sessionId: string): Promise<Session> {
    return Promise.reject();
  }

  async set(sessionId: string, session: Session): Promise<Session> {
    return Promise.reject();
  }

  async touch(sessionId: string, session: Session): Promise<Session> {
    return Promise.reject();
  }
}
