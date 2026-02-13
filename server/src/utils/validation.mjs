import Joi from 'joi';
import { ValidationError } from './errors.mjs';

export const schemas = {
  signup: Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createAssignment: Joi.object({
    subject: Joi.string().min(2).required(),
    description: Joi.string().allow('').optional(),
    educationLevel: Joi.string().optional(),
    departmentOrCourse: Joi.string().allow(null, '').optional(),
    deadline: Joi.date().iso().optional(),
    deliveryPlatform: Joi.string().valid('whatsapp','email','google_messages','imessage').optional(),
    paymentId: Joi.string().allow(null, '').optional(),
  }),

  initiatePayment: Joi.object({
    assignmentId: Joi.string().allow(null, '').optional(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().optional(),
  }),

  updateAssignmentStatus: Joi.object({
    status: Joi.string().valid('pending', 'in_progress', 'delivered').required(),
  }),
};

export function validateSchema(schema) {
  return (req, res, next) => {
    const target = req.body || {};
    const { error } = schema.validate(target, { abortEarly: false, stripUnknown: true });
    if (error) return next(new ValidationError(error.details.map(d => d.message).join(', ')));
    next();
  };
}

export default { schemas, validateSchema };
