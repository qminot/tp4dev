import fs from 'fs';
import path from 'path';
import Fastify from 'fastify';import fastifyBasicAuth from "@fastify/basic-auth"

const port = 4567;
const authenticate = {realm: 'Westeros'}

const fastify = Fastify({
    logger: true,
    http2: true,
    https: {
        key: fs.readFileSync(path.join(process.cwd(), 'server.key')),
        cert: fs.readFileSync(path.join(process.cwd(), 'server.crt')),
        allowHTTP1: true
    }
});

fastify.register(fastifyBasicAuth, {
    validate,
    authenticate
})

async function validate(username, password, req, reply) {
    if (username !== 'Tyrion' || password !== 'wine') {
        return new Error('Winter is coming')
    }
}

fastify.get('/dmz', {}, (req, res) => {
    res.send({replique: "Ca pourrait être mieux protégé..."})
})

fastify.after(() => {
    fastify.route({
        method: 'GET',
        url: '/secu',
        onRequest: fastify.basicAuth,
        handler: async (req, reply) => {
            return {
                replique: 'Un Lannister paye toujours ses dettes !'
            }
        }
    })
    fastify.route({
        method: 'GET',
        url: '/autre',
        handler: async (req, reply) => {
            return {
                replique: "Cette route ne nécessite pas d'autentification."
            }
        }
    })
})

fastify.setErrorHandler(function (err, req, reply) {

    if (err.statusCode === 401) {
        console.log(err)
        reply.code(401).send({replique: 'Tu ne sais rien, John Snow..'})
    }
    reply.send(err)
})

fastify.listen(4567, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
});