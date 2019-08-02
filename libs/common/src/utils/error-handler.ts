import * as express from 'express';
const util = require('util');
const http = require('http');

interface ResponseError extends Error {
  status: string;
  code: number;
}

export class ErrorHandler {

  static handler404(req: express.Request, res: express.Response, next: express.NextFunction) {
    const error = new Error('Not found' + req.originalUrl);
    next(error);
  }

  static prodErrorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    const meanError = ErrorHandler.getMeanError(error, req);

    if (meanError.status < 500) {
      delete meanError.stack;
    }

    if (error.noResponse === true) { return; }

    delete meanError.stack;
    res.status(meanError.status);
    res.json(meanError);
  }

  static getMeanError(error, req) {
    const status = (function () {
      const tempStatus = error.status || 500;
      const parsed = parseInt(tempStatus, 10);
      if (isNaN(parsed) || !(600 > parsed && 200 <= parsed)) {
        return 500;
      } else {
        return parsed;
      }
    })();

    const code = (function () {
      const tempCode = error.status || status;
      const parsed = parseInt(tempCode, 10);
      if (isNaN(parsed)) {
        return 500;
      } else {
        return parsed;
      }
    })();

    const meanError = {
      status: status,
      statusDesc: http.STATUS_CODES[status],
      code: code,
      message: error.message,
      stack: error.stack || (new Error()).stack
    };

    return meanError;
  }

  static generate(httpStatus, errorCode, message) {
    let params = [message];
    const args = Array.prototype.slice.call(arguments);

    for (const arg of args) {
      if (!util.isArray(arg)) {
        params.push(arg);
      } else {
        params = params.concat(arg);
      }
    }

    const error: ResponseError = new Error(util.format.apply(util, params)) as ResponseError;
    error.stack = error.stack.split(/\n/g).splice(2).join('\n');
    error.status = httpStatus;
    // error.status = errorCode;
    error.message = message;
    return error;
  }
}
