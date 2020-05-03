import mongoose, { Schema, Document } from 'mongoose';

export interface Store extends Document {
  domain: string;
  token: string;
  scopes: string[];
  installed: boolean;
}

export const StoreSchema = new Schema<Store>(
  {
    domain: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    scopes: { type: [String], required: true },
    installed: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

const stores =
  mongoose.models.Store ??
  mongoose.model<Store>('Store', StoreSchema, 'stores', true);

export async function findStoreByDomain(
  domain: Store['domain'],
): Promise<Store | undefined> {
  return await stores.findOne({ domain });
}

export interface UpsertStoreByDomainInput {
  domain: Store['domain'];
  token: Store['token'];
  scopes: Store['scopes'];
}

export async function upsertStoreByDomain(input: UpsertStoreByDomainInput) {
  const { domain } = input;
  return await stores.findOneAndUpdate({ domain }, input, { upsert: true });
}
