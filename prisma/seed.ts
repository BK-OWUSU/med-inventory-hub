import 'dotenv/config'
import { hashPassword } from "@/lib/auths/auths-functions"
import { generateNextCustomId } from "@/lib/utils"
import { sendTempPasswordEmail } from "@/lib/mailer/email"
import { prisma } from "@/lib/database/dbConnection"
import { FacilityType } from '@/generated/prisma/enums'

async function main() {
  console.log("🚀 Starting database seeding pipeline...")

  const adminName = process.env.SUPER_ADMIN_NAME
  const adminEmail = process.env.SUPER_ADMIN_EMAIL
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD

  if (!adminName || !adminEmail || !adminPassword) {
    throw new Error(
      "❌ Seeding Aborted: Missing required environment variables (SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD)."
    )
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  })

  if (existingSuperAdmin) {
    console.log(`⏩ Seed Skipped: A SUPER_ADMIN account already exists (${existingSuperAdmin.email}).`)
    return
  }

  console.log("🔒 No active SUPER_ADMIN found. Initializing global system infrastructure and accounts...")

  // 1. Prepare data BEFORE transaction to save precious milliseconds
  const hashedPassword = await hashPassword(adminPassword)
  let userCustomId = ""
  let createdEmail = ""
  let createdFullName = ""

  // 2. Pure Database Transaction Execution
  await prisma.$transaction(async (tx) => {
    // A. Ensure the GLOBAL-SYSTEM Facility entry exists to satisfy database constraints
    const facility = await tx.facility.upsert({
      where: { customId: "FAC-GLOBAL" },
      update: {},
      create: {
        customId: "FAC-GLOBAL",
        name: "Global Administration Portal",
        type: FacilityType.SYSTEM_GLOBAL, 
        location: "System Core Network",
        isVerified: true,
        isActive: true,
      },
    })

    console.log("🏢 Core Facility configuration verified: 'GLOBAL-SYSTEM' mapping verified.")

    // B. Generate sequence identity keys for the admin
    userCustomId = await generateNextCustomId({
      tx,
      facilityId: facility.id || "", 
      sequenceType: "USER",
      prefix: "SADM",
    })

    // C. Create the superAdmin account
    const superAdmin = await tx.user.create({
      data: {
        customId: userCustomId,
        email: adminEmail.toLowerCase().trim(),
        password: hashedPassword,
        fullName: adminName.trim(),
        role: "SUPER_ADMIN",
        facilityId: facility.id || null, 
        isActive: true,
        needsPasswordChange: true,
      },
    })

    // Save details to use for the email after the transaction safely commits
    createdEmail = superAdmin.email
    createdFullName = superAdmin.fullName

    // D. Record the initialization event log
    await tx.auditLog.create({
      data: {
        userId: superAdmin.id,
        facilityId: null,
        action: "USER_CREATED",
        entityType: "USER",
        entityId: superAdmin.id,
        details: {
          message: "Global infrastructure core SUPER_ADMIN account initialized via seed execution script.",
          customId: userCustomId,
          assignedFacility: "GLOBAL_SYSTEM_ADMIN",
        },
      },
    })
  }) // 🌟 Transaction closes safely here

  console.log(`✅ Database write complete. Account created with Custom ID: ${userCustomId}`)

  // 3. Dispatch network requests AFTER the transaction is safely committed
  try {
    console.log(`📨 Attempting to dispatch onboarding parameters to: ${createdEmail}...`)
    
    await sendTempPasswordEmail(
      createdEmail,
      createdEmail, 
      adminPassword,    
      createdFullName,
      "System Administration Portal"
    )
    
    console.log("📧 Success: Notification parameters routed to target mailbox successfully.")
  } catch (mailError) {
    console.error("⚠️ Mailer Notice: Database record saved, but onboarding email dispatch failed:", mailError)
  }

  console.log("🏁 Database seeding completed successfully.")
}

main()
  .catch((error) => {
    console.error("❌ Critical System Failure: Seeding sequence interrupted:")
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })