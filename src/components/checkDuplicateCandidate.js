// utils/checkDuplicateCandidate.js
import { prisma } from "../prismaClient.js";

export const findExistingCandidate = async (email, name) => {
  if (!email || !name) return null;

  return await prisma.candidate.findFirst({
    where: {
      AND: [
        { email: { equals: email.trim().toLowerCase(), mode: "insensitive" } },
        { name: { equals: name.trim(), mode: "insensitive" } },
      ]
    }
  });
};
