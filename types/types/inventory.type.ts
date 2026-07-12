import { Prisma } from "@/generated/prisma/client"
export type InventoryListResponse = {
  inventories: Prisma.InventoryGetPayload<{
    include: {
      drug: {
        select: {
          id: true
          name: true
          dosageForm: true 
        }
      }
      facility: {
        select: {
          id: true
          name: true
        }
      }
    }
  }>[]
}
export type InventoryWithRelations = InventoryListResponse["inventories"][number]