import mongoose, { Document, Schema } from 'mongoose';

export interface IGasto extends Document {
  id: number; // ID secuencial numérico
  fecha: Date;
  descripcion: string;
  comentarios: string;
  total: number;
  usuarioCreador: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // El _id ya lo hereda de Document
}

const GastoSchema: Schema = new Schema({
  fecha: {
    type: Date,
    required: [true, 'Fecha is required'],
    default: Date.now
  },
  descripcion: {
    type: String,
    required: [true, 'Descripción is required'],
    trim: true,
    maxlength: [200, 'Descripción cannot exceed 200 characters']
  },
  comentarios: {
    type: String,
    trim: true,
    maxlength: [500, 'Comentarios cannot exceed 500 characters'],
    default: ''
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total must be greater than or equal to 0'],
    validate: {
      validator: function(value: number) {
        return value >= 0;
      },
      message: 'Total must be greater than or equal to 0'
    }
  },
  usuarioCreador: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware para generar ID secuencial
GastoSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastGasto = await mongoose.model('Gasto').findOne({}, {}, { sort: { '_id': -1 } });
    this.id = lastGasto ? (lastGasto.id || 0) + 1 : 1;
  }
  next();
});

// Índices para optimización
GastoSchema.index({ fecha: -1 });
GastoSchema.index({ usuarioCreador: 1 });
GastoSchema.index({ descripcion: 1 });
GastoSchema.index({ fecha: 1, usuarioCreador: 1 });

export const Gasto = mongoose.model<IGasto>('Gasto', GastoSchema);
