import { Store } from 'express-session';
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";

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
    };

    get(sessionId, callback) {
        console.log("get session id " + JSON.stringify(sessionId));
        return callback(null, null);
    };

    set(sessionId, session, callback) {
        console.log("set session id " + JSON.stringify(sessionId));
        console.log("set session " + JSON.stringify(session));
        const timestamp = Math.floor(Date.now() / 1000);
        console.log("timestamp " + timestamp);

        const command = new PutItemCommand({
            Item: {
                expires: { N: `${timestamp + this.ttl}` },
                session: { S: JSON.stringify(session) },
                [this.hashKey]: { S: `${this.prefix}:${sessionId}`}
            },
            TableName: this.table,
            ReturnConsumedCapacity: 'TOTAL'
        });
        return this.dynamoClient.send(command)
            .then((data) => {
                console.log("dynamo put success " + JSON.stringify(data));
                return callback(null);
            })
            .catch((err) => {
                console.log("dynamo put error " + err);
                return callback(err);
            });
    };

    destroy(sessionId, callback) {
        console.log("destroy session id " + JSON.stringify(sessionId));
        return callback(null);
    };

    touch(sessionId, session, callback) {
        console.log("touch session id " + JSON.stringify(sessionId));
        return callback(null);
    };

    all(callback) {
        console.log("all ");
    };

    clear(callback) {
        console.log("clear");
        return callback(null);
    };
}

// https://github.com/webcc/cassandra-store/blob/master/lib/CassandraStore.js
// https://github.com/tj/connect-redis/blob/master/lib/connect-redis.js
// https://github.com/jdesboeufs/connect-mongo/blob/master/src/lib/MongoStore.ts
// https://github.com/ca98am79/connect-dynamodb/blob/master/lib/connect-dynamodb.js
