import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bookingsRouter from "./bookings";
import statsRouter from "./stats";
import memoriesRouter from "./memories";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bookingsRouter);
router.use(statsRouter);
router.use(memoriesRouter);
router.use(contactRouter);

export default router;
