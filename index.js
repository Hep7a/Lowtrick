const { spawn } = require("child_process")

console.log("nodemon")
const shell = spawn("node dist/index.js", {
  stdio: "inherit",
  shell: true
})

console.log("tsc")
const shell2 = spawn("tsc --watch", {
  stdio: "inherit",
  shell: true
})