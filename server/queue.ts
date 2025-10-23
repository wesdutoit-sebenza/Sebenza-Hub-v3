import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(process.env.REDIS_URL!);
export const screeningQueue = new Queue("screening", { connection });
