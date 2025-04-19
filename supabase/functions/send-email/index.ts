
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'password_changed' | 'deposit_success' | 'order_processed';
  data: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: EmailRequest = await req.json();
    
    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    let htmlContent = '';
    
    // Generate HTML content based on email type
    switch (type) {
      case 'password_changed':
        htmlContent = `
          <h1>Password Changed Successfully</h1>
          <p>Hello,</p>
          <p>Your password was successfully changed at ${new Date().toLocaleString()}.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <p>Best regards,<br>The AccZen Team</p>
        `;
        break;
        
      case 'deposit_success':
        htmlContent = `
          <h1>Deposit Confirmed</h1>
          <p>Hello,</p>
          <p>We're pleased to inform you that your deposit of ${data.amount} has been successful.</p>
          <p>Transaction ID: ${data.transactionId}</p>
          <p>Date: ${new Date(data.date).toLocaleString()}</p>
          <p>Your updated account balance is now: ${data.newBalance}</p>
          <p>Thank you for using our services!</p>
          <p>Best regards,<br>The AccZen Team</p>
        `;
        break;
        
      case 'order_processed':
        htmlContent = `
          <h1>Order Processed Successfully</h1>
          <p>Hello,</p>
          <p>Your order has been processed successfully.</p>
          <p>Order ID: ${data.orderId}</p>
          <p>Product: ${data.product}</p>
          <p>Amount: ${data.amount}</p>
          <p>Date: ${new Date(data.date).toLocaleString()}</p>
          <p>Thank you for your purchase!</p>
          <p>Best regards,<br>The AccZen Team</p>
        `;
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Invalid email type" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
    }

    const emailResponse = await resend.emails.send({
      from: "AccZen <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
