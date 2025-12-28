export let customQueueTasks=[ { taskId:"queue-1", prompt:"Summarize this text", paid:true } ];
export async function checkCustomQueue(){ return customQueueTasks; }
