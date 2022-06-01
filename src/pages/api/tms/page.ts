import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Page } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Page>
) {
  if (req.method === "POST") {
    const { name, projectId } = req.body ?? {};

    console.log(req.body);

    const result = await prisma.page.create({
      data: {
        name,
        projectId,
      },
    });

    if (!result) {
      return res.status(404);
    }

    res.json(result);
  } else if (req.method === "DELETE") {
    const { id } = req.body ?? {};

    const result = await prisma.page.delete({
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
