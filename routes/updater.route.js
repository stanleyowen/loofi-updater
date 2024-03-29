import semver from "semver";
import express from "express";
import download from "download";
import { Octokit } from "octokit";
const router = express.Router();

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

// Validate the platform whether it is darwin, linux, or windows
function validatePlatform(platform) {
  return (
    platform === "darwin" || platform === "linux" || platform === "windows"
  );
}

function validateArch(arch) {
  return (
    arch === "x86_64" ||
    arch === "i686" ||
    arch === "aarch64" ||
    arch === "armv7"
  );
}
// :platform is the platform of the app that is requesting the update (darwin, linux, windows)
// :current_version is the version of the app that is requesting the update
// For more information, refer to https://tauri.app/v1/api/config#updaterconfig.endpoints
router.get("/:platform/:arch/:current_version", async (req, res) => {
  const { platform, arch, current_version } = req.params;
  if (!platform || !validatePlatform(platform))
    return res.status(400).send("Invalid platform");
  else if (!arch || !validateArch(arch))
    return res.status(400).send("Invalid machine architecture");
  else if (!current_version || !semver.valid(current_version))
    return res.status(400).send("Invalid version");

  // Get the latest release from GitHub
  await octokit
    .request("GET /repos/stanleyowen/loofi/releases/latest", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then(async (response) => {
      const { tag_name, html_url, published_at } = response.data;

      // Check if the current version is the latest version
      // If it is, return 204 No Content
      // if (!semver.gt(tag_name, current_version))
      //   return res.status(200).send("App is up to date");

      // Check platform and get the download URL of the updater
      // Windows: .msi.zip
      // macOS (Darwin): .dmg.tar.gz, .app.tar.gz
      // Linux: .deb.tar.gz, .AppImage.tar.gz
      let url;
      switch (true) {
        case platform === "darwin" && (arch === "x86_64" || arch === "aarch64"):
          url =
            response.data.assets.filter((asset) =>
              asset.name.endsWith(".app.tar.gz")
            )[0].browser_download_url ??
            response.data.assets.filter((asset) =>
              asset.name.endsWith(".dmg.tar.gz")
            )[0].browser_download_url;
          break;
        case platform === "linux" && arch === "x86_64":
          url =
            response.data.assets.filter((asset) =>
              asset.name.endsWith(".AppImage.tar.gz")
            )[0].browser_download_url ??
            response.data.assets.filter((asset) =>
              asset.name.endsWith(".deb.tar.gz")
            )[0].browser_download_url;
          break;
        case platform === "windows" && arch === "x86_64":
          url = response.data.assets.filter((asset) =>
            asset.name.endsWith(".msi.zip")
          )[0].browser_download_url;
          break;
        default:
          return res
            .status(400)
            .send(
              "Updates not found for the specified platform and architecture. Please check the release notes for more information."
            );
      }

      res.status(200).send(
        JSON.stringify(
          {
            version: tag_name,
            pub_date: published_at,
            url,
            signature: (await download(url + ".sig")).toString(),
            notes: `Please refer to the release notes at ${html_url} for more information.`,
          },
          null,
          2
        )
      );
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error);
    });
});

export default router;
