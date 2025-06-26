import { Request, Response } from "express";

export const getUser = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "User fetched successfully",
    data: req.user,
  });
};