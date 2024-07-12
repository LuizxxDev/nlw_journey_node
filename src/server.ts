import fastify from "fastify";

const app = fastify();


app.get("/teste", () => {
    return "Hello Word!"
})

app.listen({ port: 3333 }).then(() => {
    console.log("Server Running!");
})