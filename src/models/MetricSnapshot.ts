import mongoose, { Schema, models, Document } from "mongoose";

export interface IMetricSnapshot extends Document {
  socialAccountId: mongoose.Types.ObjectId;
  date: Date;
  followers: number;
  following?: number;
  postsCount?: number;
  likes: number;
  comments: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  engagementRate: number;
  profileViews?: number;
}

const MetricSnapshotSchema = new Schema<IMetricSnapshot>(
  {
    socialAccountId: {
      type: Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
    },
    date: { type: Date, required: true },
    followers: { type: Number, default: 0 },
    following: Number,
    postsCount: Number,
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: Number,
    reach: Number,
    impressions: Number,
    engagementRate: { type: Number, default: 0 },
    profileViews: Number,
  },
  { timestamps: true }
);

MetricSnapshotSchema.index({ socialAccountId: 1, date: -1 });

export default models.MetricSnapshot ||
  mongoose.model<IMetricSnapshot>("MetricSnapshot", MetricSnapshotSchema);