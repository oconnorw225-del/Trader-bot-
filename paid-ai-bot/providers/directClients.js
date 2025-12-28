import { Payments } from "../payments.js";
export let pendingTasks=[];
export async function addDirectClientTask(email, prompt, amount){
  const taskId = `${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const link = await Payments.createPaymentLink(amount, taskId, prompt);
  console.log(`Send this Stripe checkout link to client ${email}: ${link}`);
  pendingTasks.push({ taskId, email, prompt, paid:false });
  return taskId;
}
