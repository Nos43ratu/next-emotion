import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Project } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project>
) {
  if (req.method === "POST") {
    const { name, locales } = req.body ?? {};

    const result = await prisma.project.create({
      data: {
        name,
        locales,
      },
    });

    res.json(result);
  }
}
