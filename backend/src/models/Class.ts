import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  maxParticipants: number;
  waitlist: string[];
  participants: string[];
  isActive: boolean;
}

const ClassSchema = new Schema<IClass>({
  name: { type: String, required: true },
  maxParticipants: { type: Number, required: true },
  waitlist: { type: [String], default: [] },
  participants: { type: [String], default: [] },
  isActive: { type: Boolean, default: false },
}, {
  timestamps: true
});

const ClassModel = mongoose.model<IClass>('Class', ClassSchema);

export default ClassModel;
