import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

import { DomainException } from "@domain/vaga/exceptions/domain.exception.js";
import { NaoEncontradoException } from "@domain/vaga/exceptions/nao-encontrado.exception.js";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let codigo = HttpStatus.INTERNAL_SERVER_ERROR;

    let mensagem = "Erro interno: " + exception.message;

    if (exception instanceof BadRequestException) {
      mensagem = exception.message;
      codigo = HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof DomainException) {
      codigo = HttpStatus.BAD_REQUEST;
      mensagem = exception.message;
    }

    if (exception instanceof NaoEncontradoException) {
      codigo = HttpStatus.NOT_FOUND;
      mensagem = exception.message;
    }

    response.status(400).json({
      codigo,
      mensagem,
      timestamp: new Date().toISOString(),
      caminho: request.url,
    });
  }
}
