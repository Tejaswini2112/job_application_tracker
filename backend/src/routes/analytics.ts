import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/summary", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const total = await prisma.application.count({ where: { userId } });
    const responded = await prisma.application.count({
      where: {
        userId,
        status: { not: "APPLIED" },
      },
    });
    const interviewsScheduled = await prisma.application.count({
      where: { userId, status: "INTERVIEW" },
    });
    const responseRate = total === 0 ? 0 : responded / total;
    return res.json({
      totalApplications: total,
      responseRate,
      interviewsScheduled,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
