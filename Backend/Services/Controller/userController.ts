import mongoose from "mongoose";
import express, { Router, Request, Response } from "express";
import userService from "../Service/userService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyToken } from "../../middleware/verifyToken";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import multer from "multer";
dotenv.config();

const accesstoken: string = process.env.ACCESS_TOKEN_SECRET || "";

interface User {
  _id?: mongoose.Types.ObjectId;
  username: string;
  password: string;
  profilePicture: string;
  BlockedList: string[];
  __v?: number;
}

const router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<any> => {
  const users = await userService.getAllUsers();
  return res.json(users);
});

router.get("/images", (req: Request, res: Response) => {
  const files = fs.readdirSync(path.join(__dirname, "../../Pictures"));
  const imageFiles = files.filter((file) =>
    [".jpg", ".jpeg", ".png", ".gif"].includes(path.extname(file).toLowerCase())
  );

  const imageList = imageFiles.map((filename, index) => ({
    id: index + 1,
    name: filename,
    displayName: filename.replace(/\.[^/.]+$/, ""),
    url: `/images/${filename}`,
    fullUrl: `http://localhost:8000/images/${filename}`,
  }));
  res.json(imageList);
});

router.get("/getToken", async (req: Request, res: Response): Promise<any> => {
  const token = req.cookies.token;
  res.json({ token });
});

router.get("/:userId", async (req: Request, res: Response): Promise<any> => {
  const currUserId = req.params.userId;
  const currUser = await userService.getById(currUserId);
  return res.json(currUser);
});

router.get("/getuserId", async (req: Request, res: Response): Promise<any> => {
  const username = req.body.data;
});

router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const username: string = req.body.username;
    const userDoc = await userService.findUserName(username);
    if (userDoc) {
      return res.status(500).send("User already exists");
    }
    const salt = await bcrypt.genSalt();
    const password: string = req.body.password;
    const hashedPassword: string = await bcrypt.hash(password, salt);
    const user: User = {
      username: username,
      password: hashedPassword,
      profilePicture: "",
      BlockedList: [],
    };
    const status = await userService.createUser(user);
    return res.json({ status });
  } catch {
    res.status(500).send();
  }
});

router.post("/login", async (req: Request, res: Response): Promise<any> => {
  const userDoc = await userService.findUserName(req.body.username);
  console.log(userDoc);
  if (userDoc == null) {
    return res.status(400).send("Cannot find user");
  }

  const user: User = userDoc as User;

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ userId: user._id }, accesstoken);

      console.log("Generated token:", token);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const { password, ...detailsWithoutPassword } = user;

      res.status(200).json(detailsWithoutPassword);
    } else {
      res.send("Not Allowed");
    }
  } catch {
    res.status(500).send();
  }
});

router.post(
  "/block/:id",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    const user = await userService.getById(req.userId!);
    const blockedUser = req.params.id;
    if (!user || !user.username) {
      return res.status(404).json({ error: "User not found" });
    }

    const newUser = {
      ...user.toObject(),
      BlockedList: [...(user.BlockedList || []), blockedUser],
    } as User;

    const status: string = await userService.updateUser(req.userId!, newUser);
    return res.json({ status });
  }
);

router.post(
  "/unBlock/:id",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    const user = await userService.getById(req.userId!);
    const blockedUser = req.params.id;
    if (!user || !user.username) {
      return res.status(404).json({ error: "User not found" });
    }

    const newUser = { ...user.toObject() };

    const newBlockList = newUser.BlockedList.filter(
      (user) => user !== blockedUser
    );

    const finalUser = { ...newUser, BlockedList: newBlockList } as User;
    console.log(finalUser);

    const status: string = await userService.updateUser(req.userId!, finalUser);
    return res.json({ status });
  }
);

router.post(
  "/updateUser",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    const updatedUser = req.body;
    const userId = req.userId!;
    const status = await userService.updateUser(userId, updatedUser);

    return res.json({ status });
  }
);

router.post("/logout", async (req: Request, res: Response): Promise<any> => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.clearCookie("token");

  res.status(200).json({ message: "Logout successful" });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../Pictures");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `uploaded-${uniqueSuffix}${fileExtension}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!") as any, false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/upload-profile-image",
  upload.single("profileImage"),
  async (req: Request, res: Response): Promise<any> => {
    // Make it async and Promise<any>
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageData = {
        id: Date.now(),
        name: req.file.filename,
        displayName: req.file.filename.replace(/\.[^/.]+$/, ""),
        url: `/images/${req.file.filename}`,
        fullUrl: `http://localhost:8000/images/${req.file.filename}`,
      };

      return res.json({
        // Add 'return' here for consistency
        message: "File uploaded successfully",
        image: imageData,
      });
    } catch (error) {
      return res.status(500).json({ error: "Upload failed" }); // Add 'return' here too
    }
  }
);

export default router;
