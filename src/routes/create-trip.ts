import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import nodemailer from "nodemailer";
import { getMailClient } from "../lib/mail"

export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips", {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email()
            })
        }
    } ,async (request) => {
        const {destination, starts_at, ends_at, owner_name, owner_email} = request.body

        if(dayjs(starts_at).isBefore(new Date())){
            throw new Error('Invalid trip start date');
        }

        if(dayjs(ends_at).isBefore(starts_at)) {
            throw new Error("Invalid etrip end date");
        }

        const trip = await prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
            }
        })

        

        const mail = await getMailClient();

        const message = await mail.sendMail({
            from: {
                name: 'Equipe plann.er',
                address: 'oi@plann.er',
            },
            to: {
                name: owner_name,
                address: owner_email,
            },
            subject: 'Testando envio de email',
            html: '<p>Teste do Envio de Email</p>'
        })

        console.log(nodemailer.getTestMessageUrl(message));

        return { tripId: trip.id}
    })
}