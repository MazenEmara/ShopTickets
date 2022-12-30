const { MongoClient, ObjectID } = require('mongodb');
const util = require('util');
require("dotenv").config({ path: "../config.env" }); 
util.promisify(MongoClient.connect);

let dbConnection;

const connect = async () => {
  try {
    const client = await MongoClient.connect(process.env.ATLAS_URI);
    dbConnection = client.db("WorldCup");
  } catch (e) {
    throw new Error(`Could not establish database connection: ${e}`);
  }
};

const mongoClient = async () => {
  if (!dbConnection) {
    await connect();
  }
  return dbConnection;
};

module.exports = {
  mongoClient,
  ObjectID
};