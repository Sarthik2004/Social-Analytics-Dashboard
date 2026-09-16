import mongoose, { Schema, models, Document } from "mongoose";

export interface IPost extends Document {
  socialAccountId: mongoose.Types.ObjectId;
  platformPostId: string;
  content?: string;
  mediaUrl?: string;
  postedAt: Date;
  likes: number;
  comments: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  engagementRate: number;
  type: "image" | "video" | "reel" | "carousel" | "text" | "story";
}

const PostSchema = new Schema<IPost>(
  {
    socialAccountId: {
      type: Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
    },
    platformPostId: { type: String, required: true },
    content: String,
    mediaUrl: String,
    postedAt: { type: Date, required: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: Number,
    reach: Number,
    impressions: Number,
    engagementRate: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["image", "video", "reel", "carousel", "text", "story"],
      default: "image",
    },
  },
  { timestamps: true }
);

PostSchema.index({ socialAccountId: 1, engagementRate: -1 });
PostSchema.index({ socialAccountId: 1, postedAt: -1 });

export default models.Post || mongoose.model<IPost>("Post", PostSchema);