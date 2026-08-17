import 'server-only';
import { SERVER_URL } from '@/lib/env';
import { formatDate, formatPrice } from '@/lib/utils';

/**
 * Plain, table-based HTML. Email clients are not browsers — this renders
 * predictably everywhere, which matters more here than component reuse.
 */
function layout(heading: string, body: string, cta?: { label: string; href: string }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr><td style="padding:24px 32px;border-bottom:1px solid #f4f4f5;">
            <span style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">Pluto<span style="color:#4f46e5;">Market</span></span>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;">${heading}</h1>
            ${body}
            ${
              cta
                ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                     <tr><td style="background:#4f46e5;border-radius:8px;">
                       <a href="${cta.href}" style="display:inline-block;padding:12px 22px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">${cta.label}</a>
                     </td></tr>
                   </table>`
                : ''
            }
          </td></tr>
          <tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;color:#71717a;font-size:12px;">
            You are receiving this because you have a Pluto Market account.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function itemRows(items: { name: string; amountCents: number }[]) {
  return items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:14px;">${escapeHtml(item.name)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:14px;text-align:right;white-space:nowrap;">${formatPrice(item.amountCents)}</td>
      </tr>`
    )
    .join('');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderVerificationEmail({
  name,
  token,
}: {
  name: string | null;
  token: string;
}) {
  return layout(
    `Welcome to Pluto${name ? `, ${escapeHtml(name)}` : ''}`,
    `<p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46;">
      Confirm your email address to activate your account. This link expires in 24 hours.
    </p>`,
    { label: 'Verify my email', href: `${SERVER_URL}/verify-email/${token}` }
  );
}

export function renderReceiptEmail({
  buyerName,
  orderNumber,
  date,
  totalCents,
  items,
}: {
  buyerName: string | null;
  orderNumber: string;
  date: Date;
  totalCents: number;
  items: { name: string; priceCents: number }[];
}) {
  return layout(
    'Thanks for your order',
    `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#3f3f46;">
       ${buyerName ? `${escapeHtml(buyerName)}, your` : 'Your'} payment went through and your files are ready to download.
       <br />Order <strong>${orderNumber}</strong> &middot; ${formatDate(date)}
     </p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${itemRows(items.map((i) => ({ name: i.name, amountCents: i.priceCents })))}
       <tr>
         <td style="padding:14px 0;font-size:14px;font-weight:700;">Total</td>
         <td style="padding:14px 0;font-size:14px;font-weight:700;text-align:right;">${formatPrice(totalCents)}</td>
       </tr>
     </table>`,
    { label: 'Download your files', href: `${SERVER_URL}/library` }
  );
}

export function renderSaleEmail({
  sellerName,
  orderNumber,
  items,
  payoutBlocked,
}: {
  sellerName: string | null;
  orderNumber: string;
  items: { name: string; earningsCents: number }[];
  payoutBlocked: boolean;
}) {
  const total = items.reduce((sum, i) => sum + i.earningsCents, 0);

  return layout(
    'You made a sale',
    `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#3f3f46;">
       ${sellerName ? `${escapeHtml(sellerName)}, someone` : 'Someone'} just bought from you.
       Order <strong>${orderNumber}</strong>.
     </p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${itemRows(items.map((i) => ({ name: i.name, amountCents: i.earningsCents })))}
       <tr>
         <td style="padding:14px 0;font-size:14px;font-weight:700;">Your earnings</td>
         <td style="padding:14px 0;font-size:14px;font-weight:700;text-align:right;">${formatPrice(total)}</td>
       </tr>
     </table>
     ${
       payoutBlocked
         ? `<p style="margin:20px 0 0;padding:12px 14px;background:#fef3c7;border-radius:8px;font-size:13px;line-height:1.6;color:#92400e;">
              Your earnings are on hold because your Stripe account is not connected yet.
              Connect it from your dashboard and we will pay out automatically.
            </p>`
         : `<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#71717a;">
              Amounts shown are after Pluto's 5% commission. The transfer is on its way to your Stripe account.
            </p>`
     }`,
    { label: 'Open your dashboard', href: `${SERVER_URL}/dashboard` }
  );
}
