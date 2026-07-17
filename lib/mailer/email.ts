import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // This bypasses the certificate verification that is causing the error
        //*** MUST BE REMOVED DURING DEPLOYMENT */
        rejectUnauthorized: false
    }
});

export async function sendTempPasswordEmail(
  email: string, 
  username: string, // email of the receiver can be used
  tempPass: string, 
  name: string, 
  facilityName?: string 
): Promise<void> {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`; 

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Welcome to PharmSync - Your Access Details",
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 550px; margin: 40px auto; padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                
                <!-- Branding Header -->
                <div style="margin-bottom: 24px;">
                    <h3 style="margin: 0; color: #0284c7; font-size: 18px; font-weight: 700; letter-spacing: -0.025em;">PharmaInHub</h3>
                </div>

                <!-- Greeting & Context -->
                <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.025em;">Welcome to the Team, ${name}!</h2>
                
                <!-- Conditional Facility Subtitle -->
                ${facilityName ? `<p style="font-size: 15px; font-weight: 600; color: #0284c7; margin: -8px 0 16px 0;">An account has been set up for you at ${facilityName}.</p>` : ""}

                <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">An administrator has added you to the pharmacy inventory management portal. Use your assigned credentials below to access your account dashboard.</p>
                
                <!-- Credentials Information Box -->
                <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
                    
                    <!-- Username Display -->
                    <div style="margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Username</span>
                        <span style="font-size: 16px; font-weight: 600; color: #0f172a; font-family: ui-monospace, SFMono-Regular, monospace;">${username}</span>
                    </div>

                    <!-- Temporary Password Display -->
                    <div style="text-align: center; padding-top: 8px;">
                        <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Temporary Password</p>
                        <h1 style="font-size: 32px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: 0.05em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${tempPass}</h1>
                    </div>

                </div>

                <!-- Call to Action Button -->
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${loginUrl}" style="
                        background-color: #0f172a;
                        color: #ffffff;
                        padding: 14px 32px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 15px;
                        display: inline-block;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    ">Login to Your Account</a>
                </div>

                <!-- Instructions Area -->
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                    <p style="color: #334155; font-weight: 600; font-size: 14px; margin: 0 0 12px 0;">Quick Setup Instructions:</p>
                    <ol style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 6px;">Click the login button above to access the platform.</li>
                        <li style="margin-bottom: 6px;">Sign in using your assigned username and temporary password.</li>
                        <li>Complete the mandatory OTP verification to update your permanent password securely.</li>
                    </ol>
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        If you were not expecting this invitation, please notify your pharmacy supervisor immediately.
                    </p>
                </div>
            </div>
        `
    });
}
