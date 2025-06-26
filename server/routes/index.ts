import { Router } from "express";
import userRoute from "./user.route";

const router = Router();

router.use('/api', userRoute);

export default router;