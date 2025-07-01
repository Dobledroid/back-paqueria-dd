import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
      return;
    }
    
    next();
  };
};

// Esquemas de validación para diferentes endpoints
export const schemas = {
  // Esquemas de autenticación
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    role: Joi.string().valid('admin', 'user').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Esquemas para reportes
  createReport: Joi.object({
    fechaPedido: Joi.date().optional(),
    destinatario: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Destinatario must be at least 2 characters long',
      'string.max': 'Destinatario cannot exceed 100 characters',
      'any.required': 'Destinatario is required'
    }),
    ubicacionEntrega: Joi.string().min(1).max(200).required().messages({
      'string.min': 'Ubicación must be at least 1 character long',
      'string.max': 'Ubicación cannot exceed 200 characters',
      'any.required': 'Ubicación de entrega is required'
    }),
    costo: Joi.number().min(0).required().messages({
      'number.min': 'Costo must be greater than or equal to 0',
      'any.required': 'Costo is required'
    }),
    ganancia: Joi.number().min(0).required().messages({
      'number.min': 'Ganancia must be greater than or equal to 0',
      'any.required': 'Ganancia is required'
    }),
    comentarioPedido: Joi.string().max(500).allow('').optional().messages({
      'string.max': 'Comentario cannot exceed 500 characters'
    }),
    estado: Joi.string().valid('pendiente', 'en_transito', 'entregado', 'cancelado').optional()
  }),

  updateReport: Joi.object({
    fechaPedido: Joi.date().optional(),
    destinatario: Joi.string().min(2).max(100).optional(),
    ubicacionEntrega: Joi.string().min(1).max(200).optional(),
    costo: Joi.number().min(0).optional(),
    ganancia: Joi.number().min(0).optional(),
    comentarioPedido: Joi.string().max(500).allow('').optional(),
    estado: Joi.string().valid('pendiente', 'en_transito', 'entregado', 'cancelado').optional(),
    fechaEntrega: Joi.date().optional()
  }),

  // Esquemas para gastos
  createGasto: Joi.object({
    fecha: Joi.date().optional(),
    descripcion: Joi.string().min(1).max(200).required().messages({
      'string.min': 'Descripción must be at least 1 character long',
      'string.max': 'Descripción cannot exceed 200 characters',
      'any.required': 'Descripción is required'
    }),
    comentarios: Joi.string().max(500).allow('').optional().messages({
      'string.max': 'Comentarios cannot exceed 500 characters'
    }),
    total: Joi.number().min(0).required().messages({
      'number.min': 'Total must be greater than or equal to 0',
      'any.required': 'Total is required'
    })
  }),

  updateGasto: Joi.object({
    fecha: Joi.date().optional(),
    descripcion: Joi.string().min(1).max(200).optional(),
    comentarios: Joi.string().max(500).allow('').optional(),
    total: Joi.number().min(0).optional()
  })
};
