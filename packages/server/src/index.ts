import Fastify from "fastify";

const app = Fastify({ logger: true });
const port = Number.parseInt(process.env.PORT ?? "3030", 10);

app.get("/", async () => ({ ok: true }));

app.listen({ host: "0.0.0.0", port }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
