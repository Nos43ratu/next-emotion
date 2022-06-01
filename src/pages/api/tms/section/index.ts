import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Section } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Section>
) {
  if (req.method === "POST") {
    const { name, data: sectionData, pageId } = req.body ?? {};

    const result = await prisma.section.create({
      data: {
        name,
        data: sectionData,
        pageId,
      },
    });

    if (!result) {
      return res.status(404);
    }

    res.json(result);
  } else if (req.method === "DELETE") {
    const { id } = req.body ?? {};

    const result = await prisma.section.delete({
      where: {
        id,
      },
    });

    if (!result) {
      return res.status(404);
    }

    res.json(result);
  }
}
