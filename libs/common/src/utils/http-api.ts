/**
 * Define common REST API handlers
 */

import { DateEx } from '@sip/js-core';

import { ErrorHandler } from './error-handler';

export class HttpApi {
  static onServiceUnavailable(req, rsp) {
    rsp.setHeader('Content-Type', 'application/json');
    // ref the response json schema in ./api-specs/uaa/schema/response.yml
    const rspJson = {
      status: 503, // service Unavailable
      message: 'To be finished, please wait...',
      timestamp: DateEx.getUtcTimestamp()
    };
    rsp.status(503).send(rspJson);
  }

  // @deprecated
  static getOldResponse(code, message, data?, schema?) {
    const rspJson = {
      code: code,
      message: message,
      timestamp: DateEx.getUtcTimestamp(),
      schema: schema,
      data: data
    };
    return rspJson;
  }

  static sendOldResponse(rsp, code, message, data?, schema?) {
    const rspJson = this.getOldResponse(code, message, data, schema);
    rsp.status(200).json(rspJson);
  }

  static getResponse(code, message, data?, schema?) {
    const rspJson = {
      status: code,
      message: message,
      timestamp: DateEx.getUtcTimestamp(),
      schema: schema,
      data: data
    };
    return rspJson;
  }

  static sendResponse(rsp, code, message, data?, schema?) {
    const rspJson = this.getResponse(code, message, data, schema);
    rsp.status(200).json(rspJson);
  }

  static paramsMissing(param?, status = 400, code= 1100) {
    const baseMsg = 'Missing parameters';
    const message = param ? `${baseMsg}: ${param}` : `${baseMsg}`;
    const error = ErrorHandler.generate(status, code, message);
    return error;
  }
}
