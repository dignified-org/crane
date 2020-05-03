import mongoose, { Schema, Document } from 'mongoose';
import { connect } from '.';

export interface Login extends Document {
  userId: string;
  shop: string;
  token: string;
  scope: string[];
  associatedUserScope: string[];
  expiresAt: number;
}

export const LoginSchema = new Schema<Login>(
  {
    userId: { type: String, required: true },
    shop: { type: String, required: true },
    token: { type: String, required: true },
    scope: { type: [String], required: true },
    associatedUserScope: { type: [String], required: true },
    expiresAt: { type: Number, required: true },
  },
  { timestamps: true },
);

const logins =
  mongoose.models.Login ?? mongoose.model<Login>('Login', LoginSchema);

export interface InsertLogin {
  userId: string;
  shop: string;
  token: string;
  scope: string[];
  associatedUserScope: string[];
  expiresAt: number;
}

export async function insertLogin(input: InsertLogin): Promise<Login> {
  await connect();

  return await logins.create(input);
}

export async function findValidLogin(
  userId: string,
  shop: string,
): Promise<Login | undefined> {
  await connect();

  const login = await logins.findOne(
    { userId, shop, expiresAt: { $gt: Date.now() / 1000 } },
    {},
    { sort: { createdAt: -1 } },
  );

  return login;
}
