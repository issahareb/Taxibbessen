import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./admin-auth";
import bookingsRouter from "./bookings";
import statsRouter from "./stats";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(bookingsRouter);
router.use(statsRouter);
router.use(contactRouter);

export default router;
