import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Section } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Section>
) {
  if (req.method === "GET") {
    const { id } = req.query ?? {};

    const result = await prisma.section.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!result) {
      return res.status(404);
    }

    res.json(result);
  } else if (req.method === "PATCH") {
    const { id } = req.query ?? {};
    const { data: sectionData } = req.body ?? {};

    const result = await prisma.section.update({
      where: {
        id: String(id),
      },
      data: {
        data: sectionData,
      },
    });

    if (!result) {
      return res.status(404);
    }

    res.json(result);
  }
}
