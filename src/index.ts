import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserDB } from './types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Server running at port ${3003}`)
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
            res.send("Unexpected Error")
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
            res.send("Unexpected Error")
        }
    }
})

app.post("/user", async (req: Request, res: Response) => {
    try{
        const {id, name, email, password} = req.body //como deve ser o corpo da chamada para criar um novo usuário
        
        //validações 
        if (typeof id !== "string"){
            res.status(400)
            throw new Error("'id' should be a string")
        }

        if (id.length < 4){
            res.status(400)
            throw new Error("'id' should be more then 4 characters")
        }

        if (typeof name !== "string"){
            res.status(400)
            throw new Error("'name' should be a string")
        }

        if (name.length < 2){
            res.status(400)
            throw new Error("'name' should be more then 2 characters")
        }

        if (typeof email !== "string"){
            res.status(400)
            throw new Error("'e-mail' should be a string")
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' should be in between 8 e 12 characters, with uppercase and lowercase letters and at list one number and one special character")
		}

        const [ userIdAlreadyExists ]: TUserDB[] | undefined[] = await db("user").where({id})
        
        if (userIdAlreadyExists) {
            res.status(400)
            throw new Error ("'id' already exists")
        }

        const [ userEmailAlreadyExists ]: TUserDB[] | undefined[] = await db("user").where({email})
        
        if (userEmailAlreadyExists) {
            res.status(400)
            throw new Error ("'e-mail' already exists")
        }

        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }

        await db("user").insert(newUser)
        res.status(201).send({
            message: "User created successfully",
            user: newUser
        })  

    }
    catch(error){
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Unexpected Error")
        }
    }
})

app.delete("/user/:id", async (req: Request, res: Response)=>{
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "u") {
            res.status(400)
            throw new Error ("'id' should begin with the letter 'u'")
        }

        const [ userIdAlreadyExists ]: TUserDB[] | undefined[] = await db("user").where({id: idToDelete})

        if (!userIdAlreadyExists) {
            res.status(404)
            throw new Error ("'id' not found")
        }

        await db("user_task").del().where({user_id: idToDelete })
        await db("user").del().where({id: idToDelete})

        res.status(200).send({ message: "User deletado com sucesso" })

    }
    catch (error){
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

app.get("/task", async(req: Request, res: Response) => {
    try {

        const result = await db("task")
        res.status(200).send(result)

    }

    catch {

    }
})

