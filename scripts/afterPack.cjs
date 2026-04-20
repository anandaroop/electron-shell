const path = require("path");
const fs = require("fs");

exports.default = async function (context) {
  const src = path.join(process.cwd(), ".env");
  if (!fs.existsSync(src)) return;

  const { appOutDir, packager } = context;
  const isMac = packager.platform.nodeName === "darwin";
  const resourcesDir = isMac
    ? path.join(appOutDir, `${packager.appInfo.productFilename}.app`, "Contents", "Resources")
    : path.join(appOutDir, "resources");

  fs.copyFileSync(src, path.join(resourcesDir, ".env"));
  console.log("  • copied .env into app bundle");
};
