import mongoose, { Schema, Document } from 'mongoose';
import { connect } from '.';

export interface User extends Document {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  accountOwner: boolean;
  locale: string;
  collaborator: boolean;
}

export const UserSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true }, // @todo maybe merge on email one day?
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    emailVerified: { type: Boolean, required: true },
    accountOwner: { type: Boolean, required: true },
    locale: { type: String, required: true },
    collaborator: { type: Boolean, required: true },
  },
  { timestamps: true },
);

const users = mongoose.models.User ?? mongoose.model<User>('User', UserSchema);

export interface UpsertUserByShopifyIdInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  accountOwner: boolean;
  locale: string;
  collaborator: boolean;
}

export async function upsertUserByShopifyId(
  input: UpsertUserByShopifyIdInput,
): Promise<User> {
  await connect();

  const { id } = input;
  return await users.findOneAndUpdate({ id }, input, { upsert: true });
}

export async function findUserByShopifyId(id): Promise<User | undefined> {
  await connect();
  return await users.findOne({ id });
}
