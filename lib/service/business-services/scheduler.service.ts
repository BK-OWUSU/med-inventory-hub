import cron from 'node-cron';
import { NotificationService } from './notification.service';
import { NotificationType } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/dbConnection';

export class SchedulerService {
  /**
   * Initializes the background jobs
   * Runs at 08:00 AM every day
   */
  static start() {
    // Cron string: "0 8 * * *" (Every day at 8:00 AM)
    cron.schedule('0 8 * * *', async () => {
      console.log('⏰ Running daily inventory maintenance tasks...');
      
      await Promise.all([
        this.checkLowStock(),
        this.checkExpiringDrugs()
      ]);
    });
  }

  private static async checkLowStock() {
    // Find all inventory records where quantity is at or below the threshold
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        availableQuantity: { lte: prisma.inventory.fields.minStockLevel },
        isActive: true
      },
      include: { drug: true, facility: true }
    });

    console.log(`🔍 Scheduler found ${lowStockItems.length} low stock items.`);

    for (const item of lowStockItems) {
      await NotificationService.createNotification(
        item.facilityId,
        "Low Stock Alert",
        `Critical Alert: "${item.drug.name}" is low in stock (${item.availableQuantity} remaining). Please reorder.`,
        NotificationType.INVENTORY,
        "SYSTEM_BOT" // System ID
      );
    }
  }

  private static async checkExpiringDrugs() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Find items expiring within the next 30 days
    const expiringItems = await prisma.inventory.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        },
        isActive: true
      },
      include: { drug: true, facility: true }
    });

    for (const item of expiringItems) {
      await NotificationService.createNotification(
        item.facilityId,
        "Expiry Alert",
        `Notice: "${item.drug.name}" (Batch: ${item.batchNumber || 'N/A'}) expires on ${item.expiryDate?.toDateString()}.`,
        NotificationType.INVENTORY,
        "SYSTEM_BOT"
      );
    }
  }
}