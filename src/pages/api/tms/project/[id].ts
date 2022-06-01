import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Project } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project>
) {
  if (req.method === "GET") {
    const { id } = req.query ?? {};

    const result = await prisma.project.findUnique({
      where: {
        id: String(id),
      },
      include: {
        pages: {
          include: {
            section: true,
          },
        },
      },
    });

    if (!result) {
      return res.status(404);
    }

    res.json(result);
  }
}
