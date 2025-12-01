import cluster from "cluster";
import os from "os";
import { app } from "./app.js";  // your express app
import http from "http";

const PORT = process.env.PORT || 8000;

// If the current process is the master
if (cluster.isPrimary) {
    console.log(`🚀 Primary process started with PID: ${process.pid}`);

    const cpuCount = os.cpus().length;
    console.log(`🧠 CPU Cores: ${cpuCount}`);
    console.log("⚡ Spawning workers...");

    // Fork workers equal to number of CPU cores
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    // Restart worker if it crashes
    cluster.on("exit", (worker, code, signal) => {
        console.log(`❌ Worker crashed (PID: ${worker.process.pid}). Restarting...`);
        cluster.fork();
    });

} else {
    // Workers can share the same TCP connection
    const server = http.createServer(app);

    server.listen(PORT, () => {
        console.log(`✅ Worker PID: ${process.pid} running on port ${PORT}`);
    });
}
