import 'dotenv/config'

console.log("KEY:", process.env.AWS_ACCESS_KEY_ID)
console.log("REGION:", process.env.AWS_REGION)
import 'dotenv/config'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const db = DynamoDBDocumentClient.from(client);

async function test() {
  try {

    console.log("Adding test record...");

    await db.send(new PutCommand({
      TableName: process.env.DYNAMO_TABLE,
      Item: {
        id: crypto.randomUUID(),
        name: "LOCAL TEST",
        type: "Permit",
        createdAt: new Date().toISOString()
      }
    }));

    console.log("Inserted OK ✅");

    const data = await db.send(new ScanCommand({
      TableName: process.env.DYNAMO_TABLE,
      Limit: 5
    }));

    console.log("Sample records:");
    console.log(data.Items);

  } catch (err) {
    console.error("ERROR ❌");
    console.error(err);
  }
}

test();