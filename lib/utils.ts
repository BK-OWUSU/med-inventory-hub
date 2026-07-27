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
  if (!facilityId) {
    throw new Error(`generateNextCustomId Error: facilityId is missing for sequence type "${sequenceType}".`);
  }

  const today = new Date();
  const dateString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");

  // 1. Lock the sequence row
  const sequences = await tx.$queryRaw<Array<{ id: string; currentNo: number }>>`
    SELECT id, "currentNo" FROM "Sequence"
    WHERE "facilityId" = ${facilityId} AND "type" = ${sequenceType}
    FOR UPDATE
  `;

  let sequenceId: string;
  let currentNo = 1;

  if (sequences.length === 0) {
    const newSeq = await tx.sequence.create({
      data: {
        facilityId,
        type: sequenceType,
        currentNo: 1,
      },
    });
    sequenceId = newSeq.id;
    currentNo = 1;
  } else {
    sequenceId = sequences[0].id;
    currentNo = sequences[0].currentNo + 1;
    await tx.sequence.update({
      where: { id: sequenceId },
      data: { currentNo },
    });
  }

  let sequenceNumber = String(currentNo).padStart(8, "0");
  let customId = `${prefix}-${dateString}-${sequenceNumber}`;

  // 2. Dynamic self-healing collision check based on the sequence type
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10; // Safety guard against infinite loops

  while (exists && attempts < maxAttempts) {
    attempts++;
    let found: unknown = null;

    switch (sequenceType) {
      case "STOCK_MOVEMENT":
        found = await tx.stockMovement.findUnique({ where: { customId } });
        break;
      case "ORDER":
        found = await tx.order.findUnique({ where: { customId } });
        break;
      // Add other sequence types here as your app grows (e.g., INVOICE, BATCH, etc.)
      default:
        // If it's an unknown type, assume no table check is required
        found = null;
        break;
    }

    if (found) {
      // Collision detected! Increment and try the next number
      currentNo++;
      sequenceNumber = String(currentNo).padStart(8, "0");
      customId = `${prefix}-${dateString}-${sequenceNumber}`;
    } else {
      exists = false; // Clear, no collision found
    }
  }

  // Update sequence table to the final resolved number if it had to increment
  if (attempts > 1) {
    await tx.sequence.update({
      where: { id: sequenceId },
      data: { currentNo },
    });
  }

  return customId;
}