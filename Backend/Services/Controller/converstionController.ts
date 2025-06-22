import mongoose from "mongoose";
import express, { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyToken } from "../../middleware/verifyToken";
import dotenv from "dotenv";
import conversetionsService from "../Service/conversetionsService";
dotenv.config();

const accesstoken: string = process.env.ACCESS_TOKEN_SECRET || "";

const router = express.Router();

interface Converstion {
  users: string[];
  chatName: string[];
  conversetion: [{ senderId: string; message: string; createdAt: Date }];
}

router.get(
  "/",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    const id: string = req.userId!;
    const conversetions = await conversetionsService.getConversetions(id);
    console.log("Raw conversations:", JSON.stringify(conversetions, null, 2));
    console.log("Number of conversations:", conversetions.length);
    const sorted = conversetions.sort((a, b) => {
      const aTime = a.conversation.at(-1)?.createdAt || a.createdAt;
      const bTime = b.conversation.at(-1)?.createdAt || b.createdAt;

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
    console.log("Sorted conversations:", JSON.stringify(sorted, null, 2));
    console.log("Number of conversations:", sorted.length);
    return res.json(sorted);
  }
);

router.post("/:convoId", async (req: Request, res: Response): Promise<any> => {
  const newData = req.body;
  const convoId = req.params.convoId;

  const status = await conversetionsService.updateConversetion(
    newData,
    convoId
  );

  return res.json({ status });
});

router.get(
  "/getOneConvo/:senderId",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    const senderId: string = req.params.senderId;
    const id: string = req.userId!;
    const conversation = await conversetionsService.findOneConversation(
      id,
      senderId
    );
    return res.json({ conversation });
  }
);

router.post(
  "/",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    const newConverstion = req.body;
    const userId = req.userId!;
    const status = await conversetionsService.createConversetion(
      newConverstion
    );
    return res.json({ status });
  }
);

export default router;
