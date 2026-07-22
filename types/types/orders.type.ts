import { Prisma } from "@/generated/prisma/browser";


export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        drug: {
          select: { name: true; strength: true; dosageForm: true };
        };
      };
    };
    requester: {
      select: { id: true; name: true; location: true };
    };
    supplier: {
      select: { id: true; name: true; location: true };
    };
  };
}>;