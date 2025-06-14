import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const accesstoken: string = process.env.ACCESS_TOKEN_SECRET || "";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Not authenticated!" });
    return;
  }

  jwt.verify(
    token,
    accesstoken,
    async (err: jwt.VerifyErrors | null, payload: any) => {
      if (err) {
        res.status(403).json({ message: "Token is invalid!" });
        return;
      }

      req.userId = payload.userId;

      next();
    }
  );
};
