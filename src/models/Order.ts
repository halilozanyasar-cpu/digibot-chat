import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  patientName: string;
  implantDetails: {
    brand: string;
    model: string;
    count: number;
    positions: string[];
  };
  prosthesisType: string;
  surgicalPlan: {
    approach: string;
    boneQuality: string;
    recommendations: string[];
  };
  stlFiles?: string[];
  dicomFiles?: string[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  guidePrice?: number;
  sleevePrice?: number;
  totalAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  qrCode?: string;
  reportId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
  },
  implantDetails: {
    brand: {
      type: String,
      required: [true, 'Implant brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Implant model is required'],
      trim: true,
    },
    count: {
      type: Number,
      required: [true, 'Implant count is required'],
      min: [1, 'At least 1 implant is required'],
    },
    positions: [{
      type: String,
      required: true,
    }],
  },
  prosthesisType: {
    type: String,
    required: [true, 'Prosthesis type is required'],
  },
  surgicalPlan: {
    approach: {
      type: String,
      required: true,
    },
    boneQuality: {
      type: String,
      required: true,
    },
    recommendations: [{
      type: String,
    }],
  },
  stlFiles: [{
    type: String,
  }],
  dicomFiles: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },
  guidePrice: {
    type: Number,
    min: [0, 'Price cannot be negative'],
  },
  sleevePrice: {
    type: Number,
    min: [0, 'Price cannot be negative'],
  },
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentId: {
    type: String,
  },
  qrCode: {
    type: String,
  },
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
