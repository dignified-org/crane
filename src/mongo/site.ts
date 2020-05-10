import mongoose, { Schema, Document } from 'mongoose';
import { connect } from '.';

export interface Site extends Document {
  id: string; // Vercel
  name: string; // Name provided
  storeDomain: string;
  deployHook: string; // Trigger rebuild
}

export const SiteSchema = new Schema<Site>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    storeDomain: { type: String, required: true },
    deployHook: { type: String, required: true },
  },
  { timestamps: true },
);

const sites = mongoose.models.Site ?? mongoose.model<Site>('Site', SiteSchema);

export async function findSiteByStoreDomain(
  storeDomain: string,
): Promise<Site | undefined> {
  await connect();
  return await sites.findOne({ storeDomain }, {}, { sort: { createdAt: -1 } });
}

export interface SiteInput {
  id: string; // Vercel
  name: string; // Name provided
  storeDomain: string;
  deployHook: string; // Trigger rebuild
}

export async function insertSite(input: SiteInput): Promise<Site> {
  await connect();

  return await sites.create(input);
}
