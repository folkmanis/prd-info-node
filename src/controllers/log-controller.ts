import { Controller, Get, Post, Delete, Wrapper, ClassWrapper, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import PrdSession from '../lib/session-handler';
import { LoggerDAO } from '../dao/loggerDAO';

@Controller('data/log')
@ClassMiddleware(PrdSession.validateAdminSession)
export class LogController {

}