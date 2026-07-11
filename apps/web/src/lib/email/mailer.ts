import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM || 'REP Platform <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

let resend: Resend | null = null
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

export interface SendResult {
  delivered: boolean
  transport: 'resend' | 'console' | 'error'
  id?: string
  error?: string
  // A human-readable next step when delivery fails for a known reason.
  hint?: string
}

// Resend's shared `onboarding@resend.dev` sender can ONLY deliver to the email
// address that owns the Resend account. To email arbitrary company admins you
// must verify a domain at resend.com/domains and set EMAIL_FROM to a sender on it.
const USING_SHARED_TEST_SENDER = /@resend\.dev>?$/i.test(FROM)

function deliveryHint(errorMessage: string): string | undefined {
  const msg = errorMessage.toLowerCase()
  if (USING_SHARED_TEST_SENDER || msg.includes('testing') || msg.includes('verify a domain')) {
    return (
      "Delivery is restricted because EMAIL_FROM uses Resend's shared testing sender " +
      "(onboarding@resend.dev), which only reaches your own Resend account email. " +
      'Verify a domain at resend.com/domains and set EMAIL_FROM to a sender on it ' +
      '(e.g. "REP Platform <noreply@yourdomain.com>").'
    )
  }
  return undefined
}

// Never throws — callers get a structured result so onboarding can always fall
// back to showing the temp credentials to the super admin.
async function send(to: string, subject: string, html: string): Promise<SendResult> {
  // Fallback: if Resend isn't configured yet, log the message so onboarding
  // still works locally. Swap in the key via env to actually deliver.
  if (!resend) {
    console.info(
      `\n📧 [email:console] To: ${to}\n   Subject: ${subject}\n   (RESEND_API_KEY not set — set it to deliver for real)\n`
    )
    return { delivered: false, transport: 'console' }
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) {
      const message = error.message || String(error)
      const hint = deliveryHint(message)
      console.error(`[email:resend] Failed to send to ${to}: ${message}${hint ? ` — ${hint}` : ''}`)
      return { delivered: false, transport: 'error', error: message, hint }
    }
    return { delivered: true, transport: 'resend', id: data?.id }
  } catch (e) {
    const message = (e as Error).message || 'Unknown email error'
    const hint = deliveryHint(message)
    console.error(`[email:resend] Threw sending to ${to}: ${message}${hint ? ` — ${hint}` : ''}`)
    return { delivered: false, transport: 'error', error: message, hint }
  }
}

// Sent to a company admin the moment a super admin onboards their company.
export async function sendCompanyAdminWelcome(params: {
  to: string
  companyName: string
  adminName: string
  username: string
  tempPassword: string
}): Promise<SendResult> {
  const loginUrl = `${APP_URL}/login`
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
  username: string
  tempPassword: string
}): Promise<SendResult> {
  const loginUrl = `${APP_URL}/login`
  const html = `
  <div style="font-family:'Public Sans',Arial,sans-serif;max-width:520px;margin:0 auto;color:#1C252E">
    <div style="padding:24px 0;text-align:center">
      <span style="font-size:20px;font-weight:800;color:#00A76F">REP Platform</span>
    </div>
    <div style="background:#fff;border:1px solid rgba(145,158,171,.2);border-radius:16px;padding:32px">
      <h1 style="font-size:22px;margin:0 0 8px">You've been added to ${params.companyName}</h1>
      <p style="color:#637381;margin:0 0 24px">
        ${params.name}, an account has been created for you. Sign in with the credentials
        below — you'll be asked to set a new password on first login.
      </p>
      <div style="background:#F4F6F8;border-radius:12px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:13px;color:#637381">Username</p>
        <p style="margin:0 0 16px;font-size:16px;font-weight:700">${params.username}</p>
        <p style="margin:0 0 6px;font-size:13px;color:#637381">Temporary password</p>
        <p style="margin:0;font-size:16px;font-weight:700;letter-spacing:.5px">${params.tempPassword}</p>
      </div>
      <a href="${loginUrl}"
         style="display:inline-block;background:#00A76F;color:#fff;text-decoration:none;
                padding:12px 24px;border-radius:8px;font-weight:700">Sign in</a>
      <p style="color:#919EAB;font-size:12px;margin:24px 0 0">
        For security, this temporary password must be changed immediately after you log in.
      </p>
    </div>
  </div>`
  return send(params.to, `Your REP Platform account for ${params.companyName}`, html)
}
