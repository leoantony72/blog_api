import { createApp } from "./app";

(async () => {
  const app = createApp();
  //App Listen
  app.listen(3300, () => {
    console.log("server started");
  });
})();
