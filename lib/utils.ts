import { Prisma } from "@/generated/prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const humanize = (text: string) => {
  return text
    .replace(/([A-Z])/g, ' $1') // Add space before caps
    .replace(/[_-]/g, ' ')      // Replace _ or - with spaces
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
    .trim();
};



//FUNCTION TO GENERATE CUSTOM IDS:

interface GenerateCustomIdArgs {
  tx: Prisma.TransactionClient;
  facilityId: string;
  sequenceType: string;
  prefix: string;
}

export async function generateNextCustomId({
  tx,
  facilityId,
  sequenceType,
  prefix,
}: GenerateCustomIdArgs): Promise<string> {
  const today = new Date();

  const dateString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");

  const sequence = await tx.sequence.upsert({
    where: {
      facilityId_type: {
        facilityId,
        type: sequenceType,
      },
    },
    update: {
      currentNo: {
        increment: 1,
      },
    },
    create: {
      facilityId,
      type: sequenceType,
      currentNo: 1,
    },
  });

  const sequenceNumber = String(sequence.currentNo).padStart(8, "0");

  return `${prefix}-${dateString}-${sequenceNumber}`;
}