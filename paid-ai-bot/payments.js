import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const Payments = {
  async createPaymentLink(amount, taskId, description="AI Task"){
    const link = await stripe.paymentLinks.create({
      line_items:[{ price_data:{ currency:"usd", product_data:{ name:description }, unit_amount: amount }, quantity:1 }],
      metadata: { taskId }
    });
    return link.url;
  },
  async verifyWebhook(rawBody, signature){
    return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  }
};
