// Email service simulation for GadaWallet inheritance notifications

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface InheritanceEmailData {
  heirName: string;
  heirEmail: string;
  ownerWallet: string;
  heirWallet: string;
  amount: string;
  assetType: string;
  claimUrl: string;
  personalMessage?: string;
  inactivityPeriod: number;
}

export class EmailService {
  static generateInheritanceEmail(data: InheritanceEmailData): EmailTemplate {
    const subject = `🏛️ Important: Digital Asset Inheritance Available - GadaWallet`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Digital Asset Inheritance - GadaWallet</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏛️ GadaWallet</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">Digital Asset Inheritance Notification</h2>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; background: white;">
          <h3 style="color: #1e293b; margin-top: 0;">Dear ${data.heirName},</h3>
          
          <p style="color: #374151; line-height: 1.6;">
            You have been designated as a beneficiary for digital assets on the Solana blockchain through GadaWallet's inheritance system.
          </p>
          
          <!-- Asset Details -->
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e5e7eb;">
            <h4 style="margin-top: 0; color: #1e293b;">📋 Inheritance Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Asset Amount:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 18px; font-weight: bold;">${data.amount} ${data.assetType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">From Wallet:</td>
                <td style="padding: 8px 0; color: #1e293b; font-family: monospace; font-size: 12px;">${data.ownerWallet}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Your Wallet:</td>
                <td style="padding: 8px 0; color: #1e293b; font-family: monospace; font-size: 12px;">${data.heirWallet}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Claim Period:</td>
                <td style="padding: 8px 0; color: #1e293b;">Available after ${data.inactivityPeriod} days of inactivity</td>
              </tr>
            </table>
          </div>
          
          ${data.personalMessage ? `
          <!-- Personal Message -->
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h5 style="margin-top: 0; color: #92400e;">💌 Personal Message:</h5>
            <p style="color: #92400e; font-style: italic; margin-bottom: 0;">"${data.personalMessage}"</p>
          </div>
          ` : ''}
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.claimUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🔗 Access Your Inheritance
            </a>
          </div>
          
          <!-- Instructions -->
          <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; border: 1px solid #0284c7;">
            <h5 style="margin-top: 0; color: #0f172a;">📱 What to do next:</h5>
            <ol style="color: #374151; line-height: 1.6; padding-left: 20px;">
              <li>Click the "Access Your Inheritance" button above</li>
              <li>Connect your Solana wallet (the address shown in the details)</li>
              <li>Wait for the inactivity period to complete</li>
              <li>Claim your assets when they become available</li>
              <li>Assets will transfer directly to your wallet</li>
            </ol>
          </div>
          
          <!-- Security Notes -->
          <div style="margin-top: 20px; font-size: 14px; color: #6b7280; line-height: 1.6;">
            <p><strong style="color: #374151;">Security Notes:</strong></p>
            <ul style="padding-left: 20px;">
              <li>This link is unique to you and expires in 90 days</li>
              <li>Only you can claim using your designated Solana wallet</li>
              <li>Never share this link with anyone else</li>
              <li>Keep this email secure until you're ready to claim</li>
              <li>Contact support@gadawallet.com for assistance</li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #334155; color: #cbd5e1; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0 0 5px 0; font-weight: bold;">GadaWallet - Secure Digital Asset Inheritance</p>
          <p style="margin: 0;">This email was sent because you were designated as a beneficiary.</p>
          <p style="margin: 5px 0 0 0;">If you did not expect this, please contact our support team at support@gadawallet.com</p>
        </div>
      </body>
      </html>
    `;
    
    return { subject, html };
  }

  static async simulateEmailSend(data: InheritanceEmailData): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const emailTemplate = this.generateInheritanceEmail(data);
        
        console.group('📧 EMAIL SENT SUCCESSFULLY');
        console.log('To:', data.heirEmail);
        console.log('Subject:', emailTemplate.subject);
        console.log('Claim URL:', data.claimUrl);
        console.log('Personal Message:', data.personalMessage || 'None');
        console.groupEnd();
        
        // In a real application, this would:
        // 1. Send via SendGrid, AWS SES, or similar service
        // 2. Log to database for tracking
        // 3. Handle bounces and delivery failures
        // 4. Send follow-up reminders if unclaimed
        
        resolve(true);
      }, 1500);
    });
  }

  static previewEmail(data: InheritanceEmailData): void {
    const emailTemplate = this.generateInheritanceEmail(data);
    
    // Open email preview in new window
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(emailTemplate.html);
      previewWindow.document.title = 'Email Preview - ' + emailTemplate.subject;
    }
  }
}

// Utility function for formatting wallet addresses in emails
export const formatWalletForEmail = (address: string): string => {
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
};

// Validation utilities
export const validateInheritanceData = (data: InheritanceEmailData): string[] => {
  const errors: string[] = [];
  
  if (!data.heirEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.heirEmail)) {
    errors.push('Invalid heir email address');
  }
  
  if (!data.heirName || data.heirName.trim().length === 0) {
    errors.push('Heir name is required');
  }
  
  if (!data.ownerWallet || data.ownerWallet.length < 32) {
    errors.push('Invalid owner wallet address');
  }
  
  if (!data.heirWallet || data.heirWallet.length < 32) {
    errors.push('Invalid heir wallet address');
  }
  
  if (!data.amount || parseFloat(data.amount) <= 0) {
    errors.push('Invalid asset amount');
  }
  
  if (!data.claimUrl || !data.claimUrl.startsWith('http')) {
    errors.push('Invalid claim URL');
  }
  
  return errors;
};