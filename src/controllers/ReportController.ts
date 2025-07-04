import { Request, Response } from 'express';
import { Report } from '../models/Report';
import { AuthRequest } from '../middleware/auth';
import moment from 'moment';

export class ReportController {
  // Obtener reportes para la tabla de paquetería (con paginación)
  static async getReports(req: AuthRequest, res: Response): Promise<void> {
    try {
      
      const {
        page = 1,
        limit = 10,
        fechaDesde,   // Cambiado de startDate para mantener consistencia con el frontend
        fechaHasta,   // Cambiado de endDate para mantener consistencia con el frontend
        estado,
        destinatario,
        sortBy = 'fechaPedido',
        sortOrder = 'desc'
      } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      // Construir filtros
      const filters: any = {};
      
      // Filtro por usuario (los usuarios normales solo ven sus reportes)
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = req.user._id;
      }

      // Manejo de filtros de fecha - preservar hora exacta enviada desde frontend
      if (fechaDesde || fechaHasta) {
        filters.fechaPedido = {};
        
        if (fechaDesde) {
          // Preservar la hora exacta enviada desde el frontend
          const fechaInicio = moment(fechaDesde as string).toDate();
          filters.fechaPedido.$gte = fechaInicio;
        }
        
        if (fechaHasta) {
          // Preservar la hora exacta enviada desde el frontend
          const fechaFin = moment(fechaHasta as string).toDate();
          filters.fechaPedido.$lte = fechaFin;
        }
      }

      if (estado && estado !== 'todos') {
        filters.estado = estado;
      }

      if (destinatario) {
        filters.destinatario = { $regex: destinatario, $options: 'i' };
      }

      // Configurar ordenamiento
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Obtener reportes
      const reports = await Report.find(filters)
        .populate('usuarioCreador', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber);

      // Contar total de documentos para paginación
      const total = await Report.countDocuments(filters);
      
      res.status(200).json({
        success: true,
        data: {
          reports,
          pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            totalItems: total,
            itemsPerPage: limitNumber
          }
        }
      });
    } catch (error) {
      console.error('💥 BACKEND getReports - Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Obtener un reporte por ID
  static async getReportById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const filters: any = { _id: id };
      
      // Los usuarios normales solo pueden ver sus propios reportes
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = req.user._id;
      }

      const report = await Report.findOne(filters)
        .populate('usuarioCreador', 'name email');

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { report }
      });
    } catch (error) {
      console.error('Get report by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Crear un nuevo reporte
  static async createReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Preservar la fecha exacta del frontend si viene en el request
      let reportData = {
        ...req.body,
        usuarioCreador: req.user._id
      };

      // Si viene fechaPedido, respetar exactamente el string recibido del frontend
      if (reportData.fechaPedido) {
        const fechaString = reportData.fechaPedido;
        
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
          
          reportData.fechaPedido = fechaExacta;
          // Ajustar createdAt y updatedAt para que sean la misma fecha que fechaPedido
          reportData.createdAt = fechaExacta;
          reportData.updatedAt = fechaExacta;
        } else {
          // Fallback si el formato no coincide
          const fechaFallback = new Date(fechaString + 'Z');
          reportData.fechaPedido = fechaFallback;
          reportData.createdAt = fechaFallback;
          reportData.updatedAt = fechaFallback;
        }
      }

      const report = new Report(reportData);
      await report.save();

      // Poblar los datos del usuario creador
      await report.populate('usuarioCreador', 'name email');

      res.status(201).json({
        success: true,
        message: 'Report created successfully',
        data: { report }
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Actualizar un reporte
  static async updateReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const filters: any = { _id: id };
      
      // Los usuarios normales solo pueden actualizar sus propios reportes
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = req.user._id;
      }
      
      // Procesar los datos para actualizar
      let updateData = { ...req.body };
      
      // Si viene fechaPedido, respetar exactamente el string recibido del frontend
      if (updateData.fechaPedido) {
        const fechaString = updateData.fechaPedido;
        
        // Parsear manualmente para preservar exactamente la hora
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
          
          updateData.fechaPedido = fechaExacta;
          updateData.updatedAt = fechaExacta;
        } else {
          const fechaFallback = new Date(fechaString + 'Z');
          updateData.fechaPedido = fechaFallback;
          updateData.updatedAt = fechaFallback;
        }
      }

      const report = await Report.findOneAndUpdate(
        filters,
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      ).populate('usuarioCreador', 'name email');

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found or you do not have permission to update it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        data: { report }
      });
    } catch (error) {
      console.error('Update report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Eliminar un reporte
  static async deleteReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const filters: any = { _id: id };
      
      // Los usuarios normales solo pueden eliminar sus propios reportes
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = req.user._id;
      }

      const report = await Report.findOneAndDelete(filters);

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found or you do not have permission to delete it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Obtener estadísticas de reportes
  static async getReportStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters: any = {};
      
      // Los usuarios normales solo ven estadísticas de sus reportes
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = req.user._id;
      }
      
      // Aplicar filtros de fecha si existen - preservar hora exacta
      if (req.query.fechaDesde || req.query.fechaHasta) {
        filters.fechaPedido = {};
        
        if (req.query.fechaDesde) {
          // Preservar la hora exacta enviada desde el frontend
          const fechaInicio = moment(req.query.fechaDesde as string).toDate();
          filters.fechaPedido.$gte = fechaInicio;
        }
        
        if (req.query.fechaHasta) {
          // Preservar la hora exacta enviada desde el frontend
          const fechaFin = moment(req.query.fechaHasta as string).toDate();
          filters.fechaPedido.$lte = fechaFin;
        }
      }
      
      // Filtrar por estado si se proporciona
      if (req.query.estado && req.query.estado !== 'todos') {
        filters.estado = req.query.estado;
      }
      
      const stats = await Report.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalReports: { $sum: 1 },
            totalCosto: { $sum: '$costo' },
            totalGanancia: { $sum: '$ganancia' },
            avgCosto: { $avg: '$costo' },
            avgGanancia: { $avg: '$ganancia' },
            pendientes: {
              $sum: { $cond: [{ $eq: ['$estado', 'pendiente'] }, 1, 0] }
            },
            enTransito: {
              $sum: { $cond: [{ $eq: ['$estado', 'en_transito'] }, 1, 0] }
            },
            entregados: {
              $sum: { $cond: [{ $eq: ['$estado', 'entregado'] }, 1, 0] }
            },
            cancelados: {
              $sum: { $cond: [{ $eq: ['$estado', 'cancelado'] }, 1, 0] }
            }
          }
        }
      ]);

      const statistics = stats[0] || {
        totalReports: 0,
        totalCosto: 0,
        totalGanancia: 0,
        avgCosto: 0,
        avgGanancia: 0,
        pendientes: 0,
        enTransito: 0,
        entregados: 0,
        cancelados: 0
      };

      res.status(200).json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      console.error('Get report stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Obtener datos de reportes agrupados por mes para el gráfico
  static async getReportsForChart(req: AuthRequest, res: Response): Promise<void> {
    try {
      
      const filters: any = {};
      
      // Los usuarios normales solo ven sus reportes
      if (req.user.role !== 'admin') {
        filters.usuarioCreador = req.user._id;
      }
      
      // Aplicar filtros de fecha si existen - preservar hora exacta
      if (req.query.fechaDesde || req.query.fechaHasta) {
        filters.fechaPedido = {};
        
        if (req.query.fechaDesde) {
          const fechaInicio = moment(req.query.fechaDesde as string).toDate();
          filters.fechaPedido.$gte = fechaInicio;
        
        }
        
        if (req.query.fechaHasta) {
          const fechaFin = moment(req.query.fechaHasta as string).toDate();
          filters.fechaPedido.$lte = fechaFin;
        
        }
      }
      
      // Filtrar por estado si se proporciona
      if (req.query.estado && req.query.estado !== 'todos') {
        filters.estado = req.query.estado;
      }
      
      // Agregar datos agrupados por mes y año
      const chartData = await Report.aggregate([
        { $match: filters },
        {
          $group: {
            _id: {
              year: { $year: '$fechaPedido' },
              month: { $month: '$fechaPedido' }
            },
            totalReportes: { $sum: 1 },
            totalCosto: { $sum: '$costo' },
            totalGanancia: { $sum: '$ganancia' },
            avgCosto: { $avg: '$costo' },
            avgGanancia: { $avg: '$ganancia' },
            pendientes: {
              $sum: { $cond: [{ $eq: ['$estado', 'pendiente'] }, 1, 0] }
            },
            enTransito: {
              $sum: { $cond: [{ $eq: ['$estado', 'en_transito'] }, 1, 0] }
            },
            entregados: {
              $sum: { $cond: [{ $eq: ['$estado', 'entregado'] }, 1, 0] }
            },
            cancelados: {
              $sum: { $cond: [{ $eq: ['$estado', 'cancelado'] }, 1, 0] }
            }
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
            totalReportes: 1,
            totalCosto: 1,
            totalGanancia: 1,
            avgCosto: 1,
            avgGanancia: 1,
            pendientes: 1,
            enTransito: 1,
            entregados: 1,
            cancelados: 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: { chartData }
      });
    } catch (error) {
      console.error('💥 BACKEND getReportsForChart - Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
