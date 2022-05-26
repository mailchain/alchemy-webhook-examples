import { NextFunction } from "express";
import { Request, Response } from "express-serve-static-core";

import * as crypto from "crypto";
import { IncomingMessage, ServerResponse } from "http";

export interface AlchemyRequest extends Request {
  alchemy: {
    rawBody: string;
    signature: string;
  };
}

export function isValidSignatureForAlchemyRequest(
  request: AlchemyRequest,
  signingKey: string
): boolean {
  return isValidSignatureForStringBody(
    request.alchemy.rawBody,
    request.alchemy.signature,
    signingKey
  );
}

export function isValidSignatureForStringBody(
  body: string,
  signature: string,
  signingKey: string
): boolean {
  const hmac = crypto.createHmac("sha256", signingKey); // Create a HMAC SHA256 hash using the signing key
  hmac.update(body, "utf8"); // Update the token hash with the request body using utf8
  const digest = hmac.digest("hex");
  return signature === digest;
}

export function getAlchemyRequestContext(
  req: IncomingMessage,
  _res: ServerResponse,
  buf: Buffer,
  encoding: BufferEncoding
): void {
  const signature = req.headers["x-alchemy-signature"];
  // Signature must be validated against the raw string
  var body = buf.toString(encoding || "utf8");
  (req as AlchemyRequest).alchemy = {
    rawBody: body,
    signature: signature as string,
  };
}

export function validateAlchemySignature(signingKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isValidSignatureForAlchemyRequest(req as AlchemyRequest, signingKey)) {
      res.status(403).send("Signature validation failed, unauthorized!");
    } else {
      next();
    }
  };
}

export interface WebhookEvent {
  webhookId: string;
  id: string;
  createdAt: Date;
  type: WebhookType;
  event: Record<any, any>;
}

export type WebhookType =
  | "MINED_TRANSACTION"
  | "DROPPED_TRANSACTION"
  | "ADDRESS_ACTIVITY";
