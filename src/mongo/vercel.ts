import mongoose, { Schema, Document } from 'mongoose';
import { connect } from '.';
import { VercelUser } from '../vercel';

export interface Vercel extends VercelUser, Document {
  id: string;
  userId: string; // map to users
  token: string; // access token
  updatedAt: string;
}

export const VercelSchema = new Schema<Vercel>(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true }, // @todo maybe merge on email one day?
    token: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    date: { type: String, required: true },
    avatar: { type: String, required: true },
  },
  { timestamps: true },
);

const vercels =
  mongoose.models.Vercel ?? mongoose.model<Vercel>('Vercel', VercelSchema);

export async function findVercelByUserId(userId: string) {
  await connect();

  const vercel: Vercel | undefined = await vercels.findOne({ userId });
  return vercel;
}

export async function upsertVercel(
  user: VercelUser,
  userId: string,
  token: string,
) {
  await connect();

  return await vercels.findOneAndUpdate(
    { userId },
    { ...user, userId, token },
    { upsert: true },
  );
}
