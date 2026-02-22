import { Resend } from 'resend';

// Placeholder key prevents the module-level constructor from throwing during
// `next build` when RESEND_API_KEY is not set in Vercel env vars yet.
// All send functions guard against missing keys before actually calling resend.emails.send().
const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder-resend-key');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

interface OrderItem {
  name: string;
  size: string | null;
  color?: string | null;
  qty: number;
  yards_ordered?: number;
  price: number;
}

const formatNairaHTML = (amount: number) => {
  return `&#8358;${amount.toLocaleString('en-NG')}`;
};

export async function sendOrderConfirmation(
  to: string,
  orderNumber: string,
  items: OrderItem[],
  total: number
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is missing. Skipping email send.', { to, orderNumber });
    return;
  }

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
        <strong>${item.name}</strong><br/>
        <span style="color: #666666; font-size: 12px;">${item.yards_ordered ?? item.qty} yards &mdash; ${item.color || 'Standard'}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center;">${item.qty}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right;">${formatNairaHTML(item.price)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6;">
      <div style="text-align: center; padding: 30px 0; background-color: #000000;">
        <h1 style="color: #ffffff; margin: 0; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; font-size: 24px;">315fabrics</h1>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="margin-top: 0; font-weight: 300; text-transform: uppercase;">Order Confirmed</h2>
        <p>Thank you for shopping with 3:15 Fabrics. Your order <strong>${orderNumber}</strong> has been received and is currently being processed.</p>
        
        <div style="margin: 40px 0;">
          <h3 style="font-weight: 300; text-transform: uppercase; border-bottom: 1px solid #000000; padding-bottom: 10px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #000000;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #000000;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #000000;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #000000;">Total</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #000000;">${formatNairaHTML(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="${APP_URL}/track?order=${orderNumber}" style="display: inline-block; padding: 16px 32px; background-color: #000000; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; font-weight: bold;">Track Your Order</a>
        </div>
      </div>

      <div style="text-align: center; padding: 30px 20px; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
        <p>Need help? Reply to this email or contact us on WhatsApp.</p>
        <p>&copy; ${new Date().getFullYear()} 3:15 Fabrics. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: '3:15 Fabrics <onboarding@resend.dev>', // TODO: change to orders@315fabrics.com once domain verified in Resend dashboard
      to: [to],
      subject: `Your 3:15 Fabrics order ${orderNumber} is confirmed — we'll be in touch shortly`,
      html: html,
    });

    if (error) {
      console.error('[Resend] Failed to send order confirmation email:', error);
    } else {
      console.log('[Resend] Order confirmation email sent successfully:', data);
    }
  } catch (error) {
    console.error('[Resend] Exception caught while sending email:', error);
  }
}

const STATUS_MESSAGES: Record<string, string> = {
  confirmed: 'Your order has been confirmed and is being prepared.',
  processing: 'Your order is currently being packed and prepared for shipment.',
  shipped: 'Great news! Your order has been shipped and is on its way to you.',
  delivered: 'Your order has been delivered. Thank you for shopping with 3:15 Fabrics!',
  cancelled: 'Your order has been cancelled. Please contact us if you have any questions.',
};

export async function sendOrderStatusUpdate(
  to: string,
  orderNumber: string,
  status: string,
  note?: string
) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder') {
    console.warn('[Resend] RESEND_API_KEY not configured. Skipping status update email.');
    return;
  }

  const statusMessage = STATUS_MESSAGES[status] ?? `Your order status has been updated to: ${status}.`;
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6;">
      <div style="text-align: center; padding: 30px 0; background-color: #000000;">
        <h1 style="color: #ffffff; margin: 0; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; font-size: 24px;">315fabrics</h1>
      </div>
      <div style="padding: 40px 20px;">
        <h2 style="margin-top: 0; font-weight: 300; text-transform: uppercase;">Order ${statusLabel}</h2>
        <p>Your 3:15 Fabrics order <strong>${orderNumber}</strong> has been updated.</p>
        <p>${statusMessage}</p>
        ${note ? `<div style="background: #f5f5f5; padding: 16px; margin: 20px 0; border-left: 3px solid #000;"><p style="margin: 0; font-size: 14px;"><strong>Update from us:</strong> ${note}</p></div>` : ''}
        <div style="text-align: center; margin-top: 40px;">
          <a href="${APP_URL}/track?order=${orderNumber}" style="display: inline-block; padding: 16px 32px; background-color: #000000; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; font-weight: bold;">Track Your Order</a>
        </div>
      </div>
      <div style="text-align: center; padding: 30px 20px; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
        <p>Need help? Contact us on WhatsApp or reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} 3:15 Fabrics. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: '3:15 Fabrics <onboarding@resend.dev>', // TODO: change once 315fabrics.com verified in Resend
      to: [to],
      subject: `3:15 Fabrics — Order ${orderNumber} ${statusLabel}`,
      html,
    });
    if (error) console.error('[Resend] Status update email failed:', error);
  } catch (err) {
    console.error('[Resend] Exception sending status update email:', err);
  }
}

export async function sendAbandonedCartRecovery(to: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is missing. Skipping abandoned cart email send.', { to });
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6;">
      <div style="text-align: center; padding: 30px 0; background-color: #000000;">
        <h1 style="color: #ffffff; margin: 0; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; font-size: 24px;">315fabrics</h1>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="margin-top: 0; font-weight: 300; text-transform: uppercase;">You left something behind!</h2>
        <p>We noticed you left some great items in your cart. Come back and complete your purchase securely before they sell out.</p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="${APP_URL}/cart" style="display: inline-block; padding: 16px 32px; background-color: #000000; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; font-weight: bold;">Return to Cart</a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 30px 20px; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
        <p>&copy; ${new Date().getFullYear()} 3:15 Fabrics. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: '3:15 Fabrics <onboarding@resend.dev>', // TODO: change once 315fabrics.com verified in Resend
      to: [to],
      subject: `Did you forget something? — 3:15 Fabrics`,
      html: html,
    });

    if (error) {
      console.error('[Resend] Failed to send abandoned cart email:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error('[Resend] Exception caught while sending abandoned cart email:', error);
    return { success: false, error };
  }
}
