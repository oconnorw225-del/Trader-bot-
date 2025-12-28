import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
export async function runAITask(prompt, model="gpt2"){
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`,{
    method:"POST",
    headers:{ Authorization:`Bearer ${process.env.HUGGINGFACE_API_KEY}`, "Content-Type":"application/json" },
    body:JSON.stringify({ inputs:prompt })
  });
  return await response.json();
}
