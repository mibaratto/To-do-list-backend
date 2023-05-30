import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!To-do-list" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) { 
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
//Get all or get by search term (q)
app.get("/user",async (req: Request, res: Response)=>{
    try{
        const searchedTerm = req.query.q as string | undefined

        if (searchedTerm === undefined){
            const result = await db("user")
            res.status(200).send(result)

        }else {
            const result = await db ("user").where("name", "LIKE", `%${searchedTerm}`)
            res.status(200).send(result)
        }
    }
    catch (error){
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error){
            res.send(error.message)
        }else {
            res.send("Error inesperado")
        }
    }
})