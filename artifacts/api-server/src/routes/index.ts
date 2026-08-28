import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./admin-auth";
import bookingsRouter from "./bookings";
import statsRouter from "./stats";
import contactRouter from "./contact";
import distanceRouter from "./distance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(bookingsRouter);
router.use(statsRouter);
router.use(contactRouter);
router.use(distanceRouter);

export default router;
