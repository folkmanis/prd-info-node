import { RequestParameters } from './request-parameters';
import Joi from 'joi';

export const RequestParametersSchema = Joi.object<RequestParameters>({
  page: Joi.number().integer().positive().optional(),
  query: Joi.string().optional(),
});
