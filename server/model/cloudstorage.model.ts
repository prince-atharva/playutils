import { Schema, model, models, Document, Model } from "mongoose";

export enum CloudStorageStatus {
  CONNECTED = "connected",
  FAILED = "failed",
}

export interface ICloudStorage extends Document {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  name: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  status: CloudStorageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const cloudStorageSchema = new Schema<ICloudStorage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 128 },
    accessKey: { type: String, required: true, trim: true, maxlength: 128 },
    secretKey: { type: String, required: true, trim: true, maxlength: 128 },
    bucket: { type: String, required: true, trim: true, maxlength: 128 },
    region: { type: String, required: true, trim: true, maxlength: 64 },
    status: { type: String, required: true, enum: Object.values(CloudStorageStatus) },
  },
  { timestamps: true, versionKey: false }
);

const CloudStorage: Model<ICloudStorage> =
  models.CloudStorage || model<ICloudStorage>("CloudStorage", cloudStorageSchema);

export default CloudStorage;