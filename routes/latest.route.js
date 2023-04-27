import express from "express";
import { Octokit } from "octokit";
const router = express.Router();

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

router.get("/", async (_, res) => {
  await octokit
    .request("GET /repos/stanleyowen/loofi/releases/latest", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((response) => {
      const { assets } = response.data;

      res.status(200).send(
        JSON.stringify(
          {
            version: response.data.tag_name,
            "linux-x86_64": {
              appImage: assets.filter((asset) =>
                asset.name.endsWith(".AppImage")
              )[0]?.browser_download_url,
              deb: assets.filter((asset) => asset.name.endsWith(".deb"))[0]
                ?.browser_download_url,
            },
            "darwin-x86_64": {
              dmg: assets.filter((asset) => asset.name.endsWith(".dmg"))[0]
                ?.browser_download_url,
              app: assets.filter((asset) => asset.name.endsWith(".app"))[0]
                ?.browser_download_url,
            },
            "darwin-aarch64": {
              dmg: assets.filter((asset) => asset.name.endsWith(".dmg"))[0]
                ?.browser_download_url,
              app: assets.filter((asset) => asset.name.endsWith(".app"))[0]
                ?.browser_download_url,
            },
            "windows-x86_64": {
              msi: assets.filter((asset) => asset.name.endsWith(".msi"))[0]
                ?.browser_download_url,
            },
          },
          null,
          2
        )
      );
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(JSON.stringify(error, null, 2));
    });
});

export default router;
