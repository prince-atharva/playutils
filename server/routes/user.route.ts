import { Router } from "express";
import { getUser } from "../controller/user.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get('/get', authenticate, getUser);

export default router;