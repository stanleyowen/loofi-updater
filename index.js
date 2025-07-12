import cors from "cors";
import axios from "axios";
import helmet from "helmet";
import express from "express";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";

import latestRouter from "./routes/latest.route.js";
import updateRouter from "./routes/updater.route.js";
import rateLimitRouter from "./routes/rateLimit.route.js";

// Load environment variables from .env file in development environment
if (process.env.NODE_ENV !== "production" || process.env.NODE_ENV !== "staging")
  config();

const app = express();
const PORT = process.env.PORT || 5001;
const limiter = {
  statusCode: 429,
  statusMessage: "Too Many Requests",
  message:
    "We're sorry, but you have made too many requests to our servers. Please try again later.",
};

app.use(
  cors({
    origin: (origin, cb) => {
      if (
        !origin ||
        process.env.CORS_ORIGIN === "*" ||
        process.env.CORS_ORIGIN.split(",").indexOf(origin) !== -1
      )
        cb(null, true);
      else
        cb(
          JSON.stringify(
            {
              statusCode: 401,
              statusMessage: "Unauthorized",
              message:
                "Connnection has been blocked by CORS Policy: The origin header(s) is not equal to the supplied origin.",
            },
            null,
            2
          )
        );
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use((_, res, next) => {
  res.header("Accept", "application/vnd.github.preview");
  res.header("Content-Type", "application/json; charset=UTF-8");
  return next();
});

app.use(async function (req, res, next) {
  await axios
    .post(`${process.env.WEBHOOK_URL}`, {
      content:
        "```" +
        req.method +
        " " +
        req.protocol +
        "://" +
        req.get("host") +
        req.originalUrl +
        " from " +
        req.ip +
        " with origin " +
        req.get("origin") +
        "\n" +
        JSON.stringify(req.headers, null, 2) +
        "```",
    })
    .then(() => console.log("Webhook sent!"))
    .catch((error) => console.error(error));

  next();
});

app.use(
  rateLimit({
    windowMs: 3600000, // 1 hour
    max: 100,
    handler: (req, res) =>
      res.status(429).send(JSON.stringify(limiter, null, 2)),
  })
);

app.use("/latest", latestRouter);
app.use("/updater", updateRouter);
app.use("/rate-limit", rateLimitRouter);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
