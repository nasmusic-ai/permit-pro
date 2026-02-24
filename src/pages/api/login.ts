// src/pages/api/login.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const db = DynamoDBDocumentClient.from(client);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });

  try {
    // Query user by email using GSI
    const result = await db.send(
      new QueryCommand({
        TableName: process.env.DYNAMO_TABLE,
        IndexName: "email-index",
        KeyConditionExpression: "email = :e",
        ExpressionAttributeValues: { ":e": email },
        Limit: 1,
      })
    );

    // Handle case when GSI is not ready or no items found
    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({
        error:
          "User not found or email-index is not yet active. Please try again later.",
      });
    }

    const user = result.Items[0];

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    res.status(200).json({ token });
  } catch (err: any) {
    // Special check for index not active
    if (err.name === "ValidationException" && err.message.includes("index")) {
      return res.status(503).json({
        error:
          "Login temporarily unavailable: email-index is not active yet. Try again in a few seconds.",
      });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}