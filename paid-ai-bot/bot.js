import express from "express";
import bodyParser from "body-parser";
import { checkCustomQueue, customQueueTasks } from "./providers/customQueue.js";
import { addDirectClientTask, pendingTasks } from "./providers/directClients.js";
import { checkMTurkTasks, mturkTasks } from "./providers/mturk.js";
import { checkAppenTasks, appenTasks } from "./providers/appen.js";
import { checkRapidAPITasks, rapidTasks } from "./providers/rapidapi.js";
import { runAITask } from "./huggingface.js";
import { Payments } from "./payments.js";

const app = express();
app.use(bodyParser.raw({ type: 'application/json' }));

// Stripe webhook endpoint
app.post("/stripe-webhook", (req, res)=>{
  const sig = req.headers['stripe-signature'];
  let event;
  try{
    event = Payments.verifyWebhook(req.body, sig);
  }catch(err){
    console.error("Webhook error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if(event.type==='payment_link.completed' || event.type==='checkout.session.completed'){
    const taskId = event.data.object.metadata.taskId;
    const task = pendingTasks.find(t=>t.taskId===taskId);
    if(task){ task.paid=true; console.log(`Payment verified for task ${taskId}`); runAITask(task.prompt).then(res=>console.log("AI Result:", res)); }
  }
  res.json({ received:true });
});

// Start new direct client task (example)
app.get("/new-task", async (req,res)=>{
  const {email,prompt,amount} = req.query;
  const taskId = await addDirectClientTask(email,prompt,parseInt(amount));
  res.send(`Stripe link generated, taskId: ${taskId}`);
});

// Main polling loop for other providers
async function pollProviders(){
  while(true){
    const queues = await checkCustomQueue();
    for(const task of queues) if(task.paid) runAITask(task.prompt).then(res=>console.log("Queue AI Result:",res));

    const mturks = await checkMTurkTasks();
    for(const task of mturks) if(task.paid) runAITask(task.prompt).then(res=>console.log("MTurk AI Result:",res));

    const appens = await checkAppenTasks();
    for(const task of appens) if(task.paid) runAITask(task.prompt).then(res=>console.log("Appen AI Result:",res));

    const rapids = await checkRapidAPITasks();
    for(const task of rapids) if(task.paid) runAITask(task.prompt).then(res=>console.log("RapidAPI AI Result:",res));

    await new Promise(res=>setTimeout(res,5000));
  }
}

pollProviders();
app.listen(3000,()=>console.log("Bot server running on port 3000"));
