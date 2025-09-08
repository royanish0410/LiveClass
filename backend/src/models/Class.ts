import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  name: string;
  maxParticipants: number;
  waitlist: string[];
  participants: string[];
  isActive: boolean;
  whiteboardEvents: any[];
  chatEvents: any[];
}

const classSchema = new Schema<IClass>({
  name: { type: String, required: true },
  maxParticipants: { type: Number, required: true },
  waitlist: { type: [String], default: [] },
  participants: { type: [String], default: [] },
  isActive: { type: Boolean, default: false },
  whiteboardEvents: { type: [{ type: Schema.Types.Mixed }], default: [] },
  chatEvents: { type: [{ type: Schema.Types.Mixed }], default: [] }
}, { timestamps: true });

export default mongoose.model<IClass>('Class', classSchema);
