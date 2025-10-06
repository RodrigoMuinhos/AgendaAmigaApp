import { Router } from "express";

import { container } from "../../container";
import { asyncHandler } from "../utils/asyncHandler";

const shareLinksRouter = Router();

shareLinksRouter.post(
  "/share-links",
  asyncHandler(async (req, res) => {
    const output = await container.usecases.gerarShareLink.execute(req.body);
    res.status(201).json(output);
  })
);

shareLinksRouter.get(
  "/share-links",
  asyncHandler(async (_req, res) => {
    const shareLinks = await container.repositories.shareLink.listarSnapshots();
    res.json({ shareLinks });
  })
);

export { shareLinksRouter };
