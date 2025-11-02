#!/usr/bin/env node

const { spawn } = require("child_process");

const isWindows = process.platform === "win32";
const RESET = "\x1b[0m";

const commands = [
  {
    name: "API",
    color: "\x1b[36m",
    command: "npm run api:dev",
  },
  {
    name: "WEB",
    color: "\x1b[35m",
    command: "npm run web:dev:frontend",
  },
];

const children = new Set();
let shuttingDown = false;

function prefixLines(name, color, chunk) {
  const text = chunk.toString();
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (const line of lines) {
    if (line.length) {
      process.stdout.write(`[${color}${name}${RESET}] ${line}\n`);
    }
  }
}

function runCommand({ name, color, command }) {
  const child = spawn(command, {
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
  });

  children.add(child);

  child.stdout?.on("data", (data) => prefixLines(name, color, data));
  child.stderr?.on("data", (data) => prefixLines(name, "\x1b[31m", data));

  child.on("exit", (code, signal) => {
    children.delete(child);
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[${name}] exited with ${reason}. Shutting down remaining processes...`);
    stopAll(child);
    process.exit(code ?? (signal ? 0 : 1));
  });

  return child;
}

function stopAll(except) {
  for (const child of Array.from(children)) {
    if (child === except) continue;
    try {
      if (!child.killed) {
        if (isWindows) {
          spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
        } else {
          child.kill("SIGTERM");
        }
      }
    } catch {
      // ignore
    }
  }
}

function handleSignal(signal) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down...`);
  stopAll();
  setTimeout(() => process.exit(0), 100).unref();
}

process.on("SIGINT", () => handleSignal("SIGINT"));
process.on("SIGTERM", () => handleSignal("SIGTERM"));

commands.forEach(runCommand);
