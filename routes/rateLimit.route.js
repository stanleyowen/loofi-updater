import express from "express";
import { Octokit } from "octokit";
const router = express.Router();

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

router.get("/", async (_, res) => {
  await octokit
    .request("GET /rate_limit", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((response) => {
      res.status(200).send(JSON.stringify(response, null, 2));
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(JSON.stringify(error, null, 2));
    });
});

export default router;
