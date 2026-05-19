import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async () => {
  try {
    await connectDB();
    const port = env.PORT;
    app.listen(port, () => {
      console.log(`🚀 FitCore Backend Server is running in ${env.NODE_ENV} mode on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
