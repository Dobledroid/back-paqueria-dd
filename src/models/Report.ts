import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  id: number;
  fechaPedido: Date;
  destinatario: string;
  ubicacionEntrega: string;
  costo: number;
  ganancia: number;
  comentarioPedido: string;
  estado: 'pendiente' | 'en_transito' | 'entregado' | 'cancelado';
  usuarioCreador: mongoose.Types.ObjectId;
  fechaEntrega?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  fechaPedido: {
    type: Date,
    required: [true, 'Fecha del pedido is required'],
    default: Date.now
  },
  destinatario: {
    type: String,
    required: [true, 'Destinatario is required'],
    trim: true,
    maxlength: [100, 'Destinatario cannot exceed 100 characters']
  },
  ubicacionEntrega: {
    type: String,
    required: [true, 'Ubicación de entrega is required'],
    trim: true,
    maxlength: [200, 'Ubicación cannot exceed 200 characters']
  },
  costo: {
    type: Number,
    required: [true, 'Costo is required'],
    min: [0, 'Costo must be greater than or equal to 0'],
    validate: {
      validator: function(value: number) {
        return value >= 0;
      },
      message: 'Costo must be greater than or equal to 0'
    }
  },
  ganancia: {
    type: Number,
    required: [true, 'Ganancia is required'],
    min: [0, 'Ganancia must be positive'],
    validate: {
      validator: function(value: number) {
        return value >= 0;
      },
      message: 'Ganancia must be greater than or equal to 0'
    }
  },
  comentarioPedido: {
    type: String,
    trim: true,
    maxlength: [500, 'Comentario cannot exceed 500 characters'],
    default: ''
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_transito', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  usuarioCreador: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fechaEntrega: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular el total (costo + ganancia)
ReportSchema.virtual('total').get(function(this: IReport) {
  return this.costo + this.ganancia;
});

// Middleware para generar ID secuencial
ReportSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastReport = await mongoose.model('Report').findOne({}, {}, { sort: { '_id': -1 } });
    this.id = lastReport ? (lastReport.id || 0) + 1 : 1;
  }
  next();
});

// Índices para optimización
ReportSchema.index({ fechaPedido: -1 });
ReportSchema.index({ estado: 1 });
ReportSchema.index({ usuarioCreador: 1 });
ReportSchema.index({ destinatario: 1 });
ReportSchema.index({ fechaPedido: 1, estado: 1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
