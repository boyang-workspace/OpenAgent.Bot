import { chmod, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const appName = "OpenAgent Blog Workbench";
const appPath = path.join(root, `${appName}.app`);
const contentsDir = path.join(appPath, "Contents");
const macOSDir = path.join(contentsDir, "MacOS");
const resourcesDir = path.join(contentsDir, "Resources");

const launcherScript = `#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
COMMAND_FILE="$APP_DIR/OpenAgent Blog Workbench.command"

if [ ! -f "$COMMAND_FILE" ]; then
  osascript -e 'display alert "OpenAgent launcher is missing" message "OpenAgent Blog Workbench.command was not found next to the app." as critical'
  exit 1
fi

exec /usr/bin/open -a Terminal "$COMMAND_FILE"
`;

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>${appName}</string>
  <key>CFBundleExecutable</key>
  <string>launcher</string>
  <key>CFBundleIdentifier</key>
  <string>bot.openagent.localworkbench</string>
  <key>CFBundleName</key>
  <string>${appName}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.1</string>
  <key>CFBundleVersion</key>
  <string>2</string>
  <key>LSMinimumSystemVersion</key>
  <string>13.0</string>
</dict>
</plist>
`;

async function main() {
  await rm(appPath, { recursive: true, force: true });
  await mkdir(macOSDir, { recursive: true });
  await mkdir(resourcesDir, { recursive: true });

  const launcherPath = path.join(macOSDir, "launcher");
  await writeFile(launcherPath, launcherScript);
  await chmod(launcherPath, 0o755);
  await writeFile(path.join(contentsDir, "Info.plist"), plist);

  // Keep the command launcher beside the app for LaunchServices to open in Terminal.
  await chmod(path.join(root, `${appName}.command`), 0o755);

  // Copy a lightweight Finder metadata file so the bundle is treated like a normal app.
  await writeFile(path.join(resourcesDir, "README.txt"), "OpenAgent Blog Workbench launcher bundle\n");

  console.log(`[app] created ${appPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
