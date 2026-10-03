// Upload dist/ lên hosting qua FTP. Chạy sau khi `npm run build`:
//   node --env-file=.env.production scripts/deploy.mjs
//
// Cần file .env.production (không có trong repo, xin riêng chủ dự án) chứa:
//   FTP_HOST=...
//   FTP_USER=...
//   FTP_PASS=...

import { readdirSync, copyFileSync, mkdtempSync, rmSync } from "fs";
import { join, relative, sep, extname } from "path";
import { tmpdir } from "os";
import { execFileSync } from "child_process";

const { FTP_HOST, FTP_USER, FTP_PASS } = process.env;

if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
  console.error(
    "Thiếu FTP_HOST/FTP_USER/FTP_PASS — chạy lệnh với --env-file=.env.production (xem hướng dẫn đầu file)."
  );
  process.exit(1);
}

const distDir = new URL("../dist", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ftpBase = `ftp://${FTP_HOST}/`;
const user = `${FTP_USER}:${FTP_PASS}`;

function walk(dir) {
  let files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

const files = walk(distDir);
// Tên file/thư mục có khoảng trắng hoặc dấu tiếng Việt bị lỗi encoding khi curl.exe
// trên Windows nhận trực tiếp làm tham số dòng lệnh — copy qua tên tạm ASCII trước
// khi upload để tránh lỗi "cannot open local file".
const tempDir = mkdtempSync(join(tmpdir(), "gungdetox-deploy-"));

let ok = 0;
let fail = 0;
const failed = [];

files.forEach((f, i) => {
  const rel = relative(distDir, f).split(sep).join("/");
  const encodedPath = rel.split("/").map(encodeURIComponent).join("/");
  const url = ftpBase + encodedPath;
  const safeLocal = join(tempDir, `f${i}${extname(f)}`);
  copyFileSync(f, safeLocal);
  try {
    execFileSync(
      "curl",
      ["-s", "-T", safeLocal, url, "--user", user, "--ftp-create-dirs", "--max-time", "30"],
      { stdio: "pipe" }
    );
    ok++;
  } catch (e) {
    fail++;
    failed.push(rel);
  }
});

rmSync(tempDir, { recursive: true, force: true });

console.log(`Deploy xong. OK=${ok} FAIL=${fail} TOTAL=${files.length}`);
if (failed.length) {
  console.log("Các file lỗi:\n" + failed.join("\n"));
  process.exit(1);
}
