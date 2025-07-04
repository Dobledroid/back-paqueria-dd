import { Request, Response } from 'express';
import { Gasto } from '../models/Gasto';
import { AuthRequest } from '../middleware/auth';
import moment from 'moment';
import mongoose from 'mongoose';

export class GastoController {
  // Obtener gastos con paginación y filtros
  static async getGastos(req: AuthRequest, res: Response): Promise<void> {
    try {
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Filtros base para usuarios normales (solo sus datos)
      const filters: any = {};
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = new mongoose.Types.ObjectId(req.user._id as string);
      }

      // Filtros adicionales - preservar hora exacta enviada desde frontend
      if (req.query.fechaDesde || req.query.fechaHasta) {
        filters.fecha = {};
        
        if (req.query.fechaDesde) {
          // Preservar la hora exacta enviada desde el frontend
          const fechaInicio = moment(req.query.fechaDesde as string).toDate();
          filters.fecha.$gte = fechaInicio;
         
        }
        
        if (req.query.fechaHasta) {
          // Preservar la hora exacta enviada desde el frontend
          const fechaFin = moment(req.query.fechaHasta as string).toDate();
          filters.fecha.$lte = fechaFin;
       
        }
      }

      if (req.query.descripcion) {
        filters.descripcion = { $regex: req.query.descripcion, $options: 'i' };
      }


      const gastos = await Gasto.find(filters)
        .populate('usuarioCreador', 'name email')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Gasto.countDocuments(filters);
      
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          gastos,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
          }
        }
      });
    } catch (error) {
      console.error('Get gastos error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Crear nuevo gasto
  static async createGasto(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Preservar la fecha exacta del frontend si viene en el request
      let gastoData = {
        ...req.body,
        usuarioCreador: new mongoose.Types.ObjectId(req.user._id as string)
      };

      // Si viene fecha, respetar exactamente el string recibido del frontend
      if (gastoData.fecha) {
        const fechaString = gastoData.fecha;
        
        // Extraer componentes de la fecha manualmente
        const match = fechaString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
        if (match) {
          const [, year, month, day, hour, minute, second] = match;
          // Crear fecha en UTC con los valores exactos (mes es 0-based en JS)
          const fechaExacta = new Date(Date.UTC(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day), 
            parseInt(hour), 
            parseInt(minute), 
            parseInt(second)
          ));
          
          gastoData.fecha = fechaExacta;
          // Ajustar createdAt y updatedAt para que sean la misma fecha que fecha
          gastoData.createdAt = fechaExacta;
          gastoData.updatedAt = fechaExacta;
        } else {
          // Fallback si el formato no coincide
          const fechaFallback = new Date(fechaString + 'Z');
          gastoData.fecha = fechaFallback;
          gastoData.createdAt = fechaFallback;
          gastoData.updatedAt = fechaFallback;
        }
      }

      const gasto = new Gasto(gastoData);
      await gasto.save();

      // Poblar la referencia de usuario
      await gasto.populate('usuarioCreador', 'name email');

      res.status(201).json({
        success: true,
        message: 'Gasto created successfully',
        data: { gasto }
      });
    } catch (error) {
      console.error('Create gasto error:', error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Obtener gasto por ID
  static async getGastoById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const filters: any = { _id: id };
      
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = new mongoose.Types.ObjectId(req.user._id as string);
      }

      const gasto = await Gasto.findOne(filters)
        .populate('usuarioCreador', 'name email');

      if (!gasto) {
        res.status(404).json({
          success: false,
          message: 'Gasto not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { gasto }
      });
    } catch (error) {
      console.error('Get gasto by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Actualizar gasto
  static async updateGasto(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const filters: any = { _id: id };
      
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = new mongoose.Types.ObjectId(req.user._id as string);
      }
      
      let updateData = { ...req.body };
      
      if (updateData.fecha) {
        
        const fechaString = updateData.fecha;
        
        const match = fechaString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
        if (match) {
          const [, year, month, day, hour, minute, second] = match;
          const fechaExacta = new Date(Date.UTC(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day), 
            parseInt(hour), 
            parseInt(minute), 
            parseInt(second)
          ));
          
          updateData.fecha = fechaExacta;
          updateData.updatedAt = fechaExacta;
        } else {
          const fechaFallback = new Date(fechaString + 'Z');
          updateData.fecha = fechaFallback;
          updateData.updatedAt = fechaFallback;
        }
      }

      const gasto = await Gasto.findOneAndUpdate(
        filters,
        updateData,
        { new: true, runValidators: true }
      ).populate('usuarioCreador', 'name email');

      if (!gasto) {
        res.status(404).json({
          success: false,
          message: 'Gasto not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Gasto updated successfully',
        data: { gasto }
      });
    } catch (error) {
      console.error('Update gasto error:', error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Eliminar gasto
  static async deleteGasto(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const filters: any = { _id: id };
      
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = new mongoose.Types.ObjectId(req.user._id as string);
      }
      
      const gasto = await Gasto.findOneAndDelete(filters);

      if (!gasto) {
        res.status(404).json({
          success: false,
          message: 'Gasto not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Gasto deleted successfully'
      });
    } catch (error) {
      console.error('Delete gasto error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Obtener estadísticas de gastos
  static async getGastoStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Construir filtros básicos
      const filters: any = {};
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = new mongoose.Types.ObjectId(req.user._id as string);
      }
      
      // Aplicar filtros de fecha si existen - preservar hora exacta
      if (req.query.fechaDesde || req.query.fechaHasta) {
        filters.fecha = {};
        
        if (req.query.fechaDesde) {
          // Preservar la hora exacta enviada desde el frontend
          const fechaInicio = moment(req.query.fechaDesde as string).toDate();
          filters.fecha.$gte = fechaInicio;
        }
        
        if (req.query.fechaHasta) {
          // Preservar la hora exacta enviada desde el frontend
          const fechaFin = moment(req.query.fechaHasta as string).toDate();
          filters.fecha.$lte = fechaFin;
        }
      }
      
      // Añadir filtro por descripción si existe
      if (req.query.descripcion) {
        filters.descripcion = { $regex: req.query.descripcion, $options: 'i' };
      }
      
      const stats = await Gasto.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalGastado: { $sum: '$total' },
            promedioGasto: { $avg: '$total' }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        totalGastado: 0,
        promedioGasto: 0
      };
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get gastos stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Obtener datos de gastos agrupados por mes para el gráfico
  static async getGastosForChart(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('📈 BACKEND GastoController.getGastosForChart - Query params recibidos:', req.query);
      
      const filters: any = {};
      
      // Los usuarios normales solo ven sus gastos
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = new mongoose.Types.ObjectId(req.user._id as string);
      }
      
      // Aplicar filtros de fecha si existen - preservar hora exacta
      if (req.query.fechaDesde || req.query.fechaHasta) {
        filters.fecha = {};  // Corregido: debe ser 'fecha' no 'fechaGasto'
        
        if (req.query.fechaDesde) {
          const fechaInicio = moment(req.query.fechaDesde as string).toDate();
          filters.fecha.$gte = fechaInicio;
          console.log('📅 BACKEND getGastosForChart - fechaDesde procesada:', {
            original: req.query.fechaDesde,
            convertida: fechaInicio
          });
        }
        
        if (req.query.fechaHasta) {
          const fechaFin = moment(req.query.fechaHasta as string).toDate();
          filters.fecha.$lte = fechaFin;
          console.log('📅 BACKEND getGastosForChart - fechaHasta procesada:', {
            original: req.query.fechaHasta,
            convertida: fechaFin
          });
        }
      }
      
      // Filtrar por tipo si se proporciona
      if (req.query.tipo && req.query.tipo !== 'todos') {
        filters.tipo = req.query.tipo;
      }
      
      console.log('📈 BACKEND getGastosForChart - Filtros MongoDB aplicados:', JSON.stringify(filters, null, 2));
      
      // Agregar datos agrupados por mes y año
      const chartData = await Gasto.aggregate([
        { $match: filters },
        {
          $group: {
            _id: {
              year: { $year: '$fecha' },
              month: { $month: '$fecha' }
            },
            totalGastos: { $sum: 1 },
            totalMonto: { $sum: '$total' },  // Corregido: usar '$total' no '$monto'
            avgMonto: { $avg: '$total' }     // Corregido: usar '$total' no '$monto'
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            totalGastos: 1,
            totalMonto: 1,
            avgMonto: 1,
            combustible: 1,
            mantenimiento: 1,
            otro: 1
          }
        }
      ]);

      console.log('✅ BACKEND getGastosForChart - Datos agrupados encontrados:', {
        totalMeses: chartData.length,
        datosAgrupados: chartData
      });

      res.status(200).json({
        success: true,
        data: { chartData }
      });
    } catch (error) {
      console.error('💥 BACKEND getGastosForChart - Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
