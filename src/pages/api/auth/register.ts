import type { NextApiRequest, NextApiResponse } from "next";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcrypt";

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const db = DynamoDBDocumentClient.from(client);

type RegisterRequest = {
  email: string;
  password: string;
};

type RegisterResponse = {
  success?: boolean;
  id?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body as RegisterRequest;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const item = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role: "applicant",
      createdAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE,
        Item: item,
      })
    );

    res.status(200).json({ success: true, id: item.id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
}