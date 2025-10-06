import "dotenv/config";

import { createApp } from "./app";

const app = createApp();

const PORT = Number(process.env.PORT ?? 3333);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Agenda Amiga ouvindo em http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger disponível em http://localhost:${PORT}/docs`);
});
