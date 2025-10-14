// Heir Notification and Access System for GadaWallet

## Current Problem
Heirs don't know:
1. They are designated as beneficiaries
2. How to access the platform
3. When inheritance becomes claimable
4. The owner's wallet address to search

## Comprehensive Solution

### 1. Enhanced Inheritance Creation
```typescript
interface CreateInheritanceWithNotification {
  // Existing fields
  heirAddress: string;
  percentage: number;
  inactivityDays: number;
  
  // NEW: Notification fields
  heirEmail?: string;           // Optional: heir's email
  heirPhone?: string;           // Optional: heir's phone
  heirName?: string;            // Optional: heir's name
  inheritanceMessage?: string;   // Optional: personal message
  notifyAfterDays?: number;     // Send notification after X days inactive (default: half of inactivity period)
  
  // NEW: Emergency contacts
  emergencyContacts?: Array<{
    email: string;
    phone?: string;
    relationship: string;       // "lawyer", "family", "friend"
  }>;
}
```

### 2. Notification Service Architecture
```typescript
class HeirNotificationService {
  // Monitor inheritance status and send notifications
  async checkAndNotifyHeirs() {
    const inactiveInheritances = await this.getInactiveInheritances();
    
    for (const inheritance of inactiveInheritances) {
      if (this.shouldNotifyHeir(inheritance)) {
        await this.sendHeirNotification(inheritance);
        await this.sendEmergencyNotifications(inheritance);
      }
    }
  }
  
  private async sendHeirNotification(inheritance: Inheritance) {
    const claimUrl = this.generateClaimUrl(inheritance);
    
    // Email notification
    if (inheritance.heirEmail) {
      await this.sendEmail({
        to: inheritance.heirEmail,
        subject: "Digital Assets Available for Claim - GadaWallet",
        template: "heir_notification",
        data: {
          heirName: inheritance.heirName || "Beneficiary",
          ownerAddress: inheritance.ownerAddress,
          amount: inheritance.amount,
          assetType: inheritance.assetType,
          claimUrl: claimUrl,
          inheritanceMessage: inheritance.inheritanceMessage,
          supportUrl: "https://gadawallet.com/support"
        }
      });
    }
    
    // SMS notification
    if (inheritance.heirPhone) {
      await this.sendSMS({
        to: inheritance.heirPhone,
        message: `GadaWallet: Digital assets are now available for your claim. Visit: ${claimUrl}`
      });
    }
  }
  
  private generateClaimUrl(inheritance: Inheritance): string {
    // Create secure, time-limited claim URL
    const token = this.createSecureToken(inheritance);
    return `https://gadawallet.com/claim/${inheritance.id}/${token}`;
  }
}
```

### 3. Enhanced Claim Interface
```typescript
// New claim page: /claim/:inheritanceId/:token
export function DirectClaimPage() {
  const { inheritanceId, token } = useParams();
  const [inheritanceData, setInheritanceData] = useState(null);
  const [isValidToken, setIsValidToken] = useState(false);
  
  useEffect(() => {
    // Validate token and load inheritance data
    validateClaimToken(inheritanceId, token)
      .then(data => {
        setInheritanceData(data);
        setIsValidToken(true);
      });
  }, []);
  
  if (!isValidToken) {
    return <InvalidClaimLink />;
  }
  
  return (
    <div className="claim-page">
      <h1>Digital Asset Inheritance Claim</h1>
      <div className="inheritance-details">
        <p>From: {inheritanceData.ownerAddress}</p>
        <p>Amount: {inheritanceData.amount} {inheritanceData.assetType}</p>
        <p>Available since: {inheritanceData.claimableDate}</p>
        {inheritanceData.message && (
          <div className="personal-message">
            <p>Personal message:</p>
            <p>"{inheritanceData.message}"</p>
          </div>
        )}
      </div>
      
      {!wallet.connected ? (
        <ConnectWalletPrompt 
          expectedAddress={inheritanceData.heirAddress}
          onConnect={() => /* guide user through wallet connection */}
        />
      ) : (
        <ClaimAssetsButton 
          inheritance={inheritanceData}
          onClaim={handleDirectClaim}
        />
      )}
    </div>
  );
}
```

### 4. QR Code Generation
```typescript
function generateHeirQRCode(inheritance: Inheritance): string {
  const qrData = {
    platform: "GadaWallet",
    type: "inheritance_claim",
    owner: inheritance.ownerAddress,
    heir: inheritance.heirAddress,
    amount: inheritance.amount,
    assetType: inheritance.assetType,
    claimUrl: inheritance.claimUrl,
    created: Date.now()
  };
  
  return QRCode.generate(JSON.stringify(qrData));
}

// Owner can share QR code with heir
export function InheritanceQRCode({ inheritance }) {
  const qrCode = generateHeirQRCode(inheritance);
  
  return (
    <div className="qr-section">
      <h3>Share with Your Heir</h3>
      <img src={qrCode} alt="Inheritance Claim QR Code" />
      <p>Your heir can scan this QR code to access their inheritance directly</p>
      <button onClick={() => downloadQR(qrCode)}>Download QR Code</button>
    </div>
  );
}
```

### 5. Implementation Steps

#### Step 1: Extend Smart Contract
```rust
// Add notification fields to inheritance accounts
#[account]
pub struct SmartWallet {
    // ... existing fields
    
    // NEW: Notification system
    pub heir_notifications: Vec<HeirNotification>,
    pub notification_sent: bool,
    pub emergency_contacts: Vec<EmergencyContact>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HeirNotification {
    pub heir_pubkey: Pubkey,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub notify_after_seconds: i64,
}
```

#### Step 2: Backend Notification Service
```typescript
// Cron job to check and send notifications
class InheritanceNotificationCron {
  async run() {
    const inheritances = await this.getAllActiveInheritances();
    
    for (const inheritance of inheritances) {
      if (this.shouldNotify(inheritance)) {
        await this.notificationService.notifyHeir(inheritance);
        await this.markNotificationSent(inheritance);
      }
    }
  }
}
```

#### Step 3: Enhanced Frontend
- Direct claim URLs: `/claim/:id/:token`
- QR code generation for heirs
- Email/SMS notification setup during inheritance creation
- Guided heir onboarding process

### 6. User Experience Flow

#### For Asset Owners:
1. Create inheritance with heir wallet address
2. **NEW:** Add heir's email/phone (optional)
3. **NEW:** Add personal message (optional)
4. **NEW:** Get QR code to share with heir
5. **NEW:** Set up emergency contacts

#### For Heirs:
1. **Receive notification** via email/SMS when claimable
2. **Click direct link** to claim page
3. **Connect wallet** (guided process if new to crypto)
4. **Claim assets** with one-click
5. **No need to search** or know owner's address

### 7. Security Considerations
- Time-limited claim tokens (expire after 30 days)
- Rate limiting on claim attempts
- Email/phone verification before sending notifications
- Secure token generation with inheritance-specific data
- Optional two-factor authentication for large inheritances

This system transforms the inheritance claim process from:
**"Heir must somehow discover and manually search"**
→ **"Heir gets notified and guided through direct claim process"**