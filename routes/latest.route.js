import axios from "axios";
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  axios
    .get("https://api.github.com/repos/stanleyowen/loofi/releases/latest")
    .then((response) => {
      const assets = response.data.assets;
      res.status(200).send(
        JSON.stringify(
          {
            version: response.data.tag_name,
            linux: {
              appImage: assets.filter((asset) =>
                asset.name.endsWith(".AppImage")
              )[0].browser_download_url,
              deb: assets.filter((asset) => asset.name.endsWith(".deb"))[0]
                .browser_download_url,
            },
            macOS: {
              dmg: assets.filter((asset) => asset.name.endsWith(".dmg"))[0]
                .browser_download_url,
            },
            windows: {
              msi: assets.filter((asset) => asset.name.endsWith(".msi"))[0]
                .browser_download_url,
            },
          },
          null,
          2
        )
      );
    })
    .catch((error) => {
      console.log(error);
    });
});

export default router;
