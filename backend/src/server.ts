import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";

const host = env.HOST;

app.listen(env.PORT, host, () => {
  console.log(`API listening on ${host}:${env.PORT} (${env.NODE_ENV})`);
});
