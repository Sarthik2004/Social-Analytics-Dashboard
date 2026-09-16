import mongoose, { Schema, models, Document } from "mongoose";

export interface ISocialAccount extends Document {
  clientId: mongoose.Types.ObjectId;
  platform: "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok" | "youtube";
  platformUserId: string;
  username: string;
  displayName?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  profilePicture?: string;
  isActive: boolean;
}

const SocialAccountSchema = new Schema<ISocialAccount>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    platform: {
      type: String,
      enum: ["instagram", "facebook", "twitter", "linkedin", "tiktok", "youtube"],
      required: true,
    },
    platformUserId: { type: String, required: true },
    username: { type: String, required: true },
    displayName: String,
    accessToken: { type: String, required: true },
    refreshToken: String,
    tokenExpiresAt: Date,
    profilePicture: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.SocialAccount ||
  mongoose.model<ISocialAccount>("SocialAccount", SocialAccountSchema);