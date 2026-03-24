import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const noteUpdateSchema = z.object({
  body: z.string().min(1),
});

router.patch("/:noteId", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { noteId } = req.params;
    const parsed = noteUpdateSchema.parse(req.body);
    const existing = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Note not found" });
    }
    const note = await prisma.note.update({
      where: { id: noteId },
      data: { body: parsed.body.trim() },
    });
    return res.json({
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

router.delete("/:noteId", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { noteId } = req.params;
    const result = await prisma.note.deleteMany({
      where: { id: noteId, userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
