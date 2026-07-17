// instrumentation.ts
export const runtime = 'nodejs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing background services...');
    
    // Dynamically import the service so dependencies aren't analyzed at build time
    const { SchedulerService } = await import("@/lib/service/business-services/scheduler.service");
    SchedulerService.start();
  }
}