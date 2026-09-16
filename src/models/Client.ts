import mongoose, { Schema, models, Document } from "mongoose";

export interface IClient extends Document {
  name: string;
  logo?: string;
  agencyId: mongoose.Types.ObjectId;
  socialAccounts: mongoose.Types.ObjectId[];
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    logo: String,
    agencyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    socialAccounts: [{ type: Schema.Types.ObjectId, ref: "SocialAccount" }],
  },
  { timestamps: true }
);

export default models.Client || mongoose.model<IClient>("Client", ClientSchema);