import { Router } from "express";
import userRoute from "./user.route";
import cloudStorageRoute from "./cloudstorage.route";

const router = Router();

router.use('/api/user', userRoute);
router.use('/api/cloudStorage', cloudStorageRoute);

export default router;