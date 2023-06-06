import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TTaskDB, TUserDB, TUserTaskDB } from './types'

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

app.get("/user",async (req: Request, res: Response)=>{
    try{
        const searchedTerm = req.query.q as string | undefined

        if (searchedTerm === undefined){
            const result = await db("user")
            res.status(200).send(result)

        }else {
            const result = await db ("user").where("name", "LIKE", `%${searchedTerm}%`)
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
        //const id = req.body.id
        //const name = req.body.name
        //const email = req.body.email
        //const password = req.body.password
        //*** OU destruturado **

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

        if (!userIdAlreadyExists) { //undefined, when ID does not exists
            res.status(404)
            throw new Error ("'id' not found")
        }

        await db("user_task").del().where({user_id: idToDelete })
        await db("user").del().where({id: idToDelete})

        res.status(200).send({ message: "User deleted successfully" })

    }
    catch (error){
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


//GET ALL TASKS
// app.get("/task", async(req: Request, res: Response) => {
//     try {
//         const result = await db("task")
//         res.status(200).send(result)
//     }
//     catch(error) {
//         console.log(error)
//         if (req.statusCode === 200) {
//             res.status(500)
//         }
//         if (error instanceof Error) {
//             res.send(error.message)
//         } else {
//             res.send("Unexpected Error")
//         }
//     }
// })


app.get("/task", async (req: Request, res: Response) => {
    try{
        console.log("GET")
        const searchedTerm = req.query.q as string | undefined

        if(searchedTerm === undefined){
            const result = await db("task")
            res.status(200).send(result)

        } else {
            const result = await db("task")
                .where("title", "LIKE", `%${searchedTerm}%`)
                .orWhere("description", "LIKE", `%${searchedTerm}%`)
                res.status(200).send(result)
        }
    }
    catch (error) {
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

app.post("/task", async(req: Request, res: Response)=>{
    try{
        const { id, title, description } = req.body //não estamos recebendo todas as colunas

        if (typeof id !== "string") {
            res.status(400)
            throw new Error("'id' should be string")
        }

        if (id.length < 4) {
            res.status(400)
            throw new Error("'id' should be more then 4 characters")
        }

        if (typeof title !== "string") {
            res.status(400)
            throw new Error("'title' should be string")
        }

        if (title.length < 4) {
            res.status(400)
            throw new Error("'id' should be more then 4 characters")
        }

        if (typeof description !== "string") {
            res.status(400)
            throw new Error("'description' should be string")
        }
        const [ taskIdAlreadyExists ]: TTaskDB[] | undefined[] = await db("task").where({id})

        if(taskIdAlreadyExists){//se existe, significa que não veio undefined
            res.status(400)
            throw new Error("'id' alredy exists!")
        }

        const newTask ={ //não estamos enviando todas as colunas
            id,
            title,
            description
        }
        //insere
        await db("task").insert(newTask)
        //pega por id no banco com todos os dados completos (created_at, status)
        const [ insertedTask ]: TTaskDB[] = await db("task").where({ id })
        //mostra como resposta
        res.status(201).send({
            message: "Task created successfully",
            task: insertedTask
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


//PUT TASK Searched by Id

app.put("/task/:id", async(req: Request, res: Response)=>{
    try{
        console.log("PUT")
        //pegar a task a ser editada pelo id
        const idTaskToEdit = req.params.id
        console.log(idTaskToEdit)
        
        // cada informação é opcional
        const newId = req.body.id
        const newTitle = req.body.title
        const newDescription = req.body.description
        const newCreatedAt = req.body.createdAt
        const newStatus = req.body.status

        if(newId !== undefined) {
            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' should be string")
            }
    
            if (newId.length < 4) {
                res.status(400)
                throw new Error("'id' should be more then 4 characters")
            }
        }

        if(newTitle !== undefined) {
            if (typeof newTitle  !== "string") {
                res.status(400)
                throw new Error("'title' should be string")
            }
    
            if (newId.length < 4) {
                res.status(400)
                throw new Error("'title' should be more then 4 characters")
            }
        }

        if(newDescription !== undefined) {
            if (typeof newDescription  !== "string") {
                res.status(400)
                throw new Error("'Description' should be string")
            }
        }

        if(newCreatedAt !== undefined) {
            if (typeof newCreatedAt  !== "string") {
                res.status(400)
                throw new Error("'date' should be string")
            }
        }

        if(newStatus !== undefined) {
            if (typeof newStatus  !== "string") {
                res.status(400)
                throw new Error("'status' should be string")
            }
        }

        const [ tasksExists ]: TTaskDB[] | undefined[] = await db("task").where({id: idTaskToEdit})

        if (!tasksExists) {
            res.status(404)
            throw new Error("'id' não encontrada")
        }

        const newTask: TTaskDB = {
            id: newId || tasksExists.id,
            title: newTitle || tasksExists.title,
            description: newDescription || tasksExists.description,
            created_at: newCreatedAt || tasksExists.created_at,
            status: isNaN(newStatus) ? tasksExists.status : newStatus
        }

        await db("task").update(newTask).where({ id: idTaskToEdit })

        res.status(200).send({
            message: "Task edited successfully",
            task: newTask
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

app.delete("/task/:id", async (req: Request, res: Response)=>{
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "t") {
            res.status(400)
            throw new Error ("'id' should begin with the letter 't'")
        }

        const [ taskIdAlreadyExists ]: TUserDB[] | undefined[] = await db("task").where({id: idToDelete})

        if (!taskIdAlreadyExists) { //undefined, when ID does not exists
            res.status(404)
            throw new Error ("'id' not found")
        }

        await db("user_task").del().where({user_id: idToDelete })
        await db("task").del().where({id: idToDelete})

        res.status(200).send({ message: "Task deleted successfully" })

    }
    catch (error){
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

//add an user to a task
app.post("/task/:taskId/user/:userId", async (req: Request, res: Response)=>{
    try {
        const taskId = req.params.taskId
        const userId = req.params.userId
        console.log(taskId)
        console.log(userId)

        if (taskId[0] !== "t") {
            res.status(400)
            throw new Error ("'id' should begin with the letter 't'")
        }

        if (userId[0] !== "u") {
            res.status(400)
            throw new Error ("'id' should begin with the letter 't'")
        }
        //valida se a tarefa existe
        const [ taskIdAlreadyExists ]: TTaskDB[] | undefined[] = await db("task").where({id: taskId})
        console.log(taskIdAlreadyExists)

        if (!taskIdAlreadyExists) { //undefined, when ID does not exists
            res.status(404)
            throw new Error ("'task id' not found")
        }

        //valida se usuário existe
        const [ userIdAlreadyExists ]: TUserDB[] | undefined[] = await db("user").where({id: userId})

        if (!userIdAlreadyExists) { //undefined, when ID does not exists
            res.status(404)
            throw new Error ("'user id' not found")
        }

        const newUserTask: TUserTaskDB = {
            task_id: taskId,
            user_id: userId
            
        }
        await db("user_task").insert(newUserTask)
        res.status(201).send({ message: "User added a taks successfully" })

    }
    catch (error){
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

//deletando o vinculo usuário-tarefa
app.delete("/task/:taskId/user/:userId", async (req: Request, res: Response)=>{
    try {
        const taskIdToDelete = req.params.taskId
        const userIdToDelete = req.params.userId
        console.log(taskIdToDelete)
        console.log(userIdToDelete)

        if (taskIdToDelete[0] !== "t") {
            res.status(400)
            throw new Error ("'id' should begin with the letter 't'")
        }

        if (userIdToDelete[0] !== "u") {
            res.status(400)
            throw new Error ("'id' should begin with the letter 't'")
        }
        //valida se a tarefa existe
        const [ taskIdAlreadyExists ]: TTaskDB[] | undefined[] = await db("task").where({id: taskIdToDelete})
        console.log(taskIdAlreadyExists)

        if (!taskIdAlreadyExists) { //undefined, when ID does not exists
            res.status(404)
            throw new Error ("'task id' not found")
        }

        //valida se usuário existe
        const [ userIdAlreadyExists ]: TUserDB[] | undefined[] = await db("user").where({id: userIdToDelete})

        if (!userIdAlreadyExists) { //undefined, when ID does not exists
            res.status(404)
            throw new Error ("'user id' not found")
        }

        await db("user_task").del()
                .where({task_id: taskIdToDelete} )
                .andWhere({user_id: userIdToDelete})
        
        res.status(200).send({ message: "User removed from task successfully" })

    }
    catch (error){
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
