import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM || 'REP Platform <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

let resend: Resend | null = null
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

export interface SendResult {
  delivered: boolean
  transport: 'resend' | 'console'
  id?: string
}

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  // Fallback: if Resend isn't configured yet, log the message so onboarding
  // still works locally. Swap in the key via env to actually deliver.
  if (!resend) {
    console.info(
      `\n📧 [email:console] To: ${to}\n   Subject: ${subject}\n   (RESEND_API_KEY not set — set it to deliver for real)\n`
    )
    return { delivered: false, transport: 'console' }
  }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return { delivered: true, transport: 'resend', id: data?.id }
}

// Sent to a company admin the moment a super admin onboards their company.
export async function sendCompanyAdminWelcome(params: {
  to: string
  companyName: string
  adminName: string
  username: string
  tempPassword: string
}): Promise<SendResult> {
  const loginUrl = `${APP_URL}/superadmin/login`
  const html = `
  <div style="font-family:'Public Sans',Arial,sans-serif;max-width:520px;margin:0 auto;color:#1C252E">
    <div style="padding:24px 0;text-align:center">
      <span style="font-size:20px;font-weight:800;color:#00A76F">REP Platform</span>
    </div>
    <div style="background:#fff;border:1px solid rgba(145,158,171,.2);border-radius:16px;padding:32px">
      <h1 style="font-size:22px;margin:0 0 8px">Welcome to REP, ${params.adminName} 👋</h1>
      <p style="color:#637381;margin:0 0 24px">
        Your workspace for <strong>${params.companyName}</strong> is ready. Sign in with the
        credentials below — you'll be asked to set a new password on first login.
      </p>
      <div style="background:#F4F6F8;border-radius:12px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:13px;color:#637381">Username</p>
        <p style="margin:0 0 16px;font-size:16px;font-weight:700">${params.username}</p>
        <p style="margin:0 0 6px;font-size:13px;color:#637381">Temporary password</p>
        <p style="margin:0;font-size:16px;font-weight:700;letter-spacing:.5px">${params.tempPassword}</p>
      </div>
      <a href="${loginUrl}"
         style="display:inline-block;background:#1C252E;color:#fff;text-decoration:none;
                padding:12px 24px;border-radius:8px;font-weight:700">Sign in to your admin console</a>
      <p style="color:#919EAB;font-size:12px;margin:24px 0 0">
        For security, this temporary password must be changed immediately after you log in.
      </p>
    </div>
  </div>`
  return send(params.to, `Your REP Platform admin account for ${params.companyName}`, html)
}

// Sent to a regular (Clerk) user when a company admin invites them.
export async function sendUserInvite(params: {
  to: string
  name: string
  companyName: string
}): Promise<SendResult> {
  const signUpUrl = `${APP_URL}/sign-up`
  const html = `
  <div style="font-family:'Public Sans',Arial,sans-serif;max-width:520px;margin:0 auto;color:#1C252E">
    <div style="padding:24px 0;text-align:center">
      <span style="font-size:20px;font-weight:800;color:#00A76F">REP Platform</span>
    </div>
    <div style="background:#fff;border:1px solid rgba(145,158,171,.2);border-radius:16px;padding:32px">
      <h1 style="font-size:22px;margin:0 0 8px">You've been invited</h1>
      <p style="color:#637381;margin:0 0 24px">
        ${params.name}, you've been added to <strong>${params.companyName}</strong> on REP Platform.
        Create your account using <strong>this email address</strong> to get access.
      </p>
      <a href="${signUpUrl}"
         style="display:inline-block;background:#00A76F;color:#fff;text-decoration:none;
                padding:12px 24px;border-radius:8px;font-weight:700">Create your account</a>
      <p style="color:#919EAB;font-size:12px;margin:24px 0 0">
        Only invited email addresses can register. If you weren't expecting this, you can ignore it.
      </p>
    </div>
  </div>`
  return send(params.to, `You've been invited to ${params.companyName} on REP Platform`, html)
}
