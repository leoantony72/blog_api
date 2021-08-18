import { createApp } from "./app";

(async () => {
  const app = createApp();
  //App Listen
  app.listen(process.env.PORT || 3000,() => {
    console.log("server started");
  });
})();
