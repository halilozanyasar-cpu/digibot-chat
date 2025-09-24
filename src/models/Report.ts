import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  orderId: mongoose.Types.ObjectId;
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
  qrCode: string;
  reportUrl: string;
  status: 'generated' | 'reviewed' | 'approved' | 'pending_approval' | 'rejected';
  // Yeni alanlar
  surgicalReportPDF?: string;
  teethData?: Array<{
    toothNumber: string;
    implantBrand: string;
    implantModel: string;
    implantDiameter: string;
    implantLength: string;
    expectedBoneQuality: string;
    recommendedDrillProtocol: string;
  }>;
  clinicalNotes?: string;
  pricing?: {
    guidePrice: number;
    sleevePrice: number;
    totalAmount: number;
    provisionAmount: number;
  };
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentData?: {
    amount: number;
    provisionAmount: number;
    transactionId: string;
    paidAt: Date;
  };
  rejectionReason?: string;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  implantDetails: {
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    positions: [{
      type: String,
      required: true,
    }],
  },
  prosthesisType: {
    type: String,
    required: true,
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
  qrCode: {
    type: String,
    required: true,
    unique: true,
  },
  reportUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['generated', 'reviewed', 'approved', 'pending_approval', 'rejected'],
    default: 'generated',
  },
  // Yeni alanlar
  surgicalReportPDF: {
    type: String,
  },
  teethData: [{
    toothNumber: {
      type: String,
      required: true,
    },
    implantBrand: {
      type: String,
      required: true,
    },
    implantModel: {
      type: String,
      required: true,
    },
    implantDiameter: {
      type: String,
      required: true,
    },
    implantLength: {
      type: String,
      required: true,
    },
    expectedBoneQuality: {
      type: String,
      required: true,
    },
    recommendedDrillProtocol: {
      type: String,
      required: true,
    },
  }],
  clinicalNotes: {
    type: String,
  },
  pricing: {
    guidePrice: {
      type: Number,
      default: 0,
    },
    sleevePrice: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    provisionAmount: {
      type: Number,
      default: 0,
    },
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentData: {
    amount: {
      type: Number,
    },
    provisionAmount: {
      type: Number,
    },
    transactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  rejectionReason: {
    type: String,
  },
  rejectedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
ReportSchema.index({ orderId: 1 });
ReportSchema.index({ userId: 1 });
ReportSchema.index({ qrCode: 1 });
ReportSchema.index({ createdAt: -1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
