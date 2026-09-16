import mongoose, { Schema, models, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "manager" | "viewer";
  image?: string;
  clients: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["admin", "manager", "viewer"],
      default: "manager",
    },
    image: String,
    clients: [{ type: Schema.Types.ObjectId, ref: "Client" }],
  },
  { timestamps: true }
);

export default models.User || mongoose.model<IUser>("User", UserSchema);