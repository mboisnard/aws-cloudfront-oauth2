import { Store } from 'express-session';
import {
    DeleteItemCommand,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    UpdateItemCommand
} from "@aws-sdk/client-dynamodb";

export class AWSDynamoDBStore extends Store {

    constructor(options) {
        super();

        this.prefix = options.prefix || 'sess';
        this.hashKey = options.hashKey || 'id';
        this.table = options.table || 'sessions';
        this.createTableIfNotExist = options.createTableIfNotExist || false;
        this.readCapacityUnits = options.readCapacityUnits || 5;
        this.writeCapacityUnits = options.writeCapacityUnits || 5;
        this.ttl = options.ttl || 900; // ttl in seconds

        this.dynamoClient = new DynamoDBClient({region: options.aws.region});

        this.getFormattedSessionId = sessionId => `${this.prefix}:${sessionId}`;
        this.currentTimestamp = () => Math.floor(Date.now() / 1000);
        this.getExpiresValue = session => {
            const ttl = session.cookie.maxAge || this.ttl;
            return this.currentTimestamp() + ttl;
        };
    };

    get(sessionId, callback) {
        console.log("get session id " + JSON.stringify(sessionId));

        const command = new GetItemCommand({
            TableName: this.table,
            Key: {
                [this.hashKey]: { S: this.getFormattedSessionId(sessionId) }
            },
            ConsistentRead: true
        });

        const sessionFound = result => result.Item && result.Item.session && result.Item.session.S;
        const sessionIsExpired = result => result.Item.expires && this.currentTimestamp() >= result.Item.expires;
        const getSessionFrom = result => JSON.parse(result.Item.session.S.toString());

        this.dynamoClient.send(command)
            .then(result => {
                if (!sessionFound(result) || sessionIsExpired(result))
                    return callback(null, null);

                const session = getSessionFrom(result);
                callback(null, session);
            })
            .catch(err => callback(err));
    };

    set(sessionId, session, callback) {
        console.log("set session " + JSON.stringify(session));
        console.log("set session id " + JSON.stringify(sessionId));

        const command = new PutItemCommand({
            Item: {
                expires: { N: `${this.getExpiresValue(session)}` },
                session: { S: JSON.stringify(session) },
                [this.hashKey]: { S: this.getFormattedSessionId(sessionId) }
            },
            TableName: this.table,
            ReturnConsumedCapacity: 'TOTAL'
        });
        this.dynamoClient.send(command, callback);
    };

    destroy(sessionId, callback) {
        console.log("destroy session id " + JSON.stringify(sessionId));

        const command = new DeleteItemCommand({
            TableName: this.table,
            Key: {
                [this.hashKey]: { S: this.getFormattedSessionId(sessionId) }
            }
        });
        this.dynamoClient.send(command, callback);
    };

    touch(sessionId, session, callback) {
        console.log("touch session id " + JSON.stringify(sessionId));

        const command = new UpdateItemCommand({
            TableName: this.table,
            Key: {
                [this.hashKey]: { S: this.getFormattedSessionId(sessionId) }
            },
            UpdateExpression: 'set expires = :e',
            ExpressionAttributeValues: {
                ':e': { N: `${this.getExpiresValue(session)}` }
            },
            ReturnValues: 'UPDATED_NEW'
        });
        this.dynamoClient.send(command, callback);
    };
}

// https://github.com/webcc/cassandra-store/blob/master/lib/CassandraStore.js
// https://github.com/tj/connect-redis/blob/master/lib/connect-redis.js
// https://github.com/jdesboeufs/connect-mongo/blob/master/src/lib/MongoStore.ts
// https://github.com/ca98am79/connect-dynamodb/blob/master/lib/connect-dynamodb.js

// https://www.npmjs.com/package/express-session
