import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

/** Mirrors `ApplicationStatus` in prisma/schema.prisma */
const ApplicationStatusSchema = z.enum([
  "APPLIED",
  "INTERVIEW",
  "REJECTED",
  "OFFER",
]);

type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

/** Shape returned by Prisma for `application` rows (no relations required) */
type ApplicationRow = {
  id: string;
  companyName: string;
  role: string;
  jobLink: string;
  applicationDate: Date;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
};

type NoteRow = {
  id: string;
  applicationId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

const createSchema = z.object({
  companyName: z.string().min(1),
  role: z.string().min(1),
  jobLink: z.string().url(),
  applicationDate: z.coerce.date(),
  status: ApplicationStatusSchema.optional(),
});

const updateSchema = z.object({
  companyName: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  jobLink: z.string().url().optional(),
  applicationDate: z.coerce.date().optional(),
  status: ApplicationStatusSchema.optional(),
});

const noteBodySchema = z.object({
  body: z.string().min(1),
});

function mapApplication(a: ApplicationRow) {
  return {
    id: a.id,
    companyName: a.companyName,
    role: a.role,
    jobLink: a.jobLink,
    applicationDate: a.applicationDate.toISOString(),
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

/** List and create — register before /:param routes */
router.get("/", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const list = await prisma.application.findMany({
      where: { userId },
      orderBy: { applicationDate: "desc" },
    });
    return res.json(list.map(mapApplication));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const body = createSchema.parse(req.body);
    const app = await prisma.application.create({
      data: {
        userId,
        companyName: body.companyName.trim(),
        role: body.role.trim(),
        jobLink: body.jobLink.trim(),
        applicationDate: body.applicationDate,
        status: body.status ?? "APPLIED",
      },
    });
    return res.status(201).json(mapApplication(app));
  } catch (e) {
    next(e);
  }
});

/** Notes nested under application */
router.get("/:applicationId/notes", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { applicationId } = req.params;
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    const notes = await prisma.note.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(
      notes.map((n: NoteRow) => ({
        id: n.id,
        applicationId: n.applicationId,
        body: n.body,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      }))
    );
  } catch (e) {
    next(e);
  }
});

router.post("/:applicationId/notes", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { applicationId } = req.params;
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    const body = noteBodySchema.parse(req.body);
    const note = await prisma.note.create({
      data: {
        applicationId,
        userId,
        body: body.body.trim(),
      },
    });
    return res.status(201).json({
      id: note.id,
      applicationId: note.applicationId,
      body: note.body,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const body = updateSchema.parse(req.body);
    const existing = await prisma.application.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }
    const app = await prisma.application.update({
      where: { id },
      data: {
        ...(body.companyName !== undefined && {
          companyName: body.companyName.trim(),
        }),
        ...(body.role !== undefined && { role: body.role.trim() }),
        ...(body.jobLink !== undefined && { jobLink: body.jobLink.trim() }),
        ...(body.applicationDate !== undefined && {
          applicationDate: body.applicationDate,
        }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return res.json(mapApplication(app));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const result = await prisma.application.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
