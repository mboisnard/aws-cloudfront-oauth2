import {Session, SessionStore} from './session';
import {DynamoDB} from 'aws-sdk';
import {GetItemInput, GetItemOutput} from 'aws-sdk/clients/dynamodb';

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
  private readonly ttl: number;
  private readonly dynamoClient: DynamoDB;

  constructor(config: AWSDynamoDBConfiguration) {
    this.prefix = config.db?.prefix || 'sess';
    this.hashKey = config.db?.hashKey || 'id';
    this.table = config.db?.table || 'sessions';
    this.ttl = config.db?.ttl || 900; // ttl in seconds

    this.dynamoClient = new DynamoDB({region: config.aws.region});
  }

  private currentTimestamp() {
    return Math.floor(Date.now() / 1000);
  }

  private getFormattedSessionId(sessionId: string): string {
    return `${this.prefix}:${sessionId}`;
  }

  private sessionFound(result: GetItemOutput) {
    return result.Item && result.Item.session && result.Item.session.S;
  }

  private sessionIsExpired(result: GetItemOutput) {
    return result.Item?.expires && this.currentTimestamp() >= result.Item.expires;
  }

  private getSessionFrom(result: any) {
    return JSON.parse(result.Item.session.S.toString()) as Session;
  }

  private getExpiresValue(session: any) {
    const ttl = session.cookie.maxAge || this.ttl;
    return this.currentTimestamp() + ttl;
  }

  async destroy(sessionId: string): Promise<void> {

    console.log("destroy session id " + JSON.stringify(sessionId));

    const param = {
      TableName: this.table,
      Key: {
        [this.hashKey]: { S: this.getFormattedSessionId(sessionId) }
      }
    };

    const self = this;
    return new Promise(function (resolve, reject) {
      self.dynamoClient.deleteItem(param, function (err, data) {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      })
    });
  }

  async get(sessionId: string): Promise<Session | undefined> {

    console.log("get session id " + JSON.stringify(sessionId));

    const params: GetItemInput = {
      TableName: this.table,
      Key: {
        [this.hashKey]: { S: this.getFormattedSessionId(sessionId) }
      },
      ConsistentRead: true
    };

    const self = this;
    return new Promise(function (resolve, reject) {
      self.dynamoClient.getItem(params, function (err, data) {
        if (err != null)
          reject(err);
        else {
          console.log("data " + JSON.stringify(data));
          if (!self.sessionFound(data) || self.sessionIsExpired(data))
            resolve(undefined);
          else
            resolve(self.getSessionFrom(data));
        }
      });
    });
  }

  async set(sessionId: string, session: Session): Promise<Session> {

    console.log("set session " + JSON.stringify(session));
    console.log("set session id " + JSON.stringify(sessionId));

    const params = {
      Item: {
        expires: { N: `${this.getExpiresValue(session)}` },
        session: { S: JSON.stringify(session) },
        [this.hashKey]: { S: this.getFormattedSessionId(sessionId) }
      },
      TableName: this.table,
      ReturnConsumedCapacity: 'TOTAL'
    };

    const self = this;
    return new Promise(function (resolve, reject) {
      self.dynamoClient.putItem(params, function (err, data) {
        if (err != null) {
          reject(err);
        } else {
          resolve(self.getSessionFrom(data))
        }
      });
    });
  }

  async touch(sessionId: string, session: Session): Promise<Session> {

    console.log("touch session id " + JSON.stringify(sessionId));

    const params = {
      TableName: this.table,
      Key: {
        [this.hashKey]: { S: this.getFormattedSessionId(sessionId) }
      },
      UpdateExpression: 'set expires = :e',
      ExpressionAttributeValues: {
        ':e': { N: `${this.getExpiresValue(session)}` }
      },
      ReturnValues: 'UPDATED_NEW'
    };

    const self = this;
    return new Promise(function (resolve, reject) {
      self.dynamoClient.updateItem(params, function (err, data) {
        if (err != null) {
          reject(err);
        } else {
          resolve(self.getSessionFrom(data));
        }
      })
    });
  }
}
