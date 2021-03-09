import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'
import fs from 'fs'
import { userInfo } from 'node:os'

const app = express()
app.use(bodyParser.json())
app.use(cors())
const SECRET_KEY = process.env.SECRET_KEY as string
const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface DbSchema {
  users: JWTPayload[]
  todos: Todos
}

interface JWTPayload {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  balance: number;
}

interface Todo {
  id: number
  title: string
}

interface Todos {
  [username: string]: Todo[]
}

const readDbFile = (): DbSchema => {
  const raw = fs.readFileSync('db.json', 'utf8')
  const db: DbSchema = JSON.parse(raw)
  return db
}

type LoginArgs = Pick<JWTPayload, 'username' | 'password'>

app.post<any, any, LoginArgs>('/login', (req, res) => {
    const { username, password } = req.body
    const db = readDbFile()
    const user = db.users.find(user => user.username === body.username)
        // Use username and password to create token.
        if (!user) {
          res.status(400)
          res.json({ message: 'Invalid username or password' })
          return
        }
        if (!bcrypt.compareSync(body.password, user.password)) {
          res.status(400)
          res.json({ message: 'Invalid username or password' })
          return
        }
        const token = jwt.sign(
          {username: user.username } as JWTPayload, 
          SECRET_KEY
        )
        if(user){
          res.status(200)
          res.json({ message: 'Login successfully',
                      token: jwt })
        }
})

type RegisterArgs = Omit<JWTPayload, 'id'>

app.post<any, any, RegisterArgs>('/register',
  body('username').isString(),
  body('password').isString(),
  body('firstname').isString(),
  body('lastname').isString(),
  body('balance').isNumeric(),
  (req, res) => {
    
    const { username, password, firstname, lastname, balance } = req.body
    const db = readDbFile()
    const hashPassword = bcrypt.hashSync(password, 10)
    db.users.push({
      id: Date.now(),
      username,
      password: hashPassword,
    })
    res.status(200)
    fs.writeFileSync('db.json', JSON.stringify(db))
    res.json({ message: 'Register successfully' })
    if(!bcrypt.compareSync(body.password , user.password)){
      res.status(400)
      fs.writeFileSync('db.json', JSON.stringify(db))
      res.json({ message: 'Register successfully' })
    }
  
  })

app.get('/balance',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
  
    }
    catch (e) {
      //response in case of invalid token
    if(token){
      res.status(200)
      res.json({ name: user.firstname,user.lastname,
                blance:user.blance})
      return
    }
    if (!token) {
      res.status(401)
      res.json({ message: 'Invalid token'})
      return
    }
  }
})
 
app.post('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
    if (validationResult(req).isEmpty()) {
        res.status(200)
        res.json({ message: 'Deposit successfully',balance: ""})
        return
      }
      if (!validationResult(req).isEmpty()){
      return res.status(400).json({ message: "Invalid data" })}
      if (!token) {
        res.status(401)
        res.json({ message: 'Invalid token' })
        return
      }
    }
    //Is amount <= 0 ? 
    catch(e){
      res.status(401)
      res.json({ message: e.message })
    }    
  }
)

app.post('/withdraw',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
    if (/*ทำงานถูกต้อง*/){
      res.status(200)
      res.json({ message: 'Withdraw successfully',balance: ""})
      return
    }
    if (/*Amount<0หรือAmount=0หรือจำนวนเงินในบัญชีมีไม่พอถอนเงิน*/) {
      res.status(400)
      res.json({ message: 'Invalid data' })
      return
    }
    if (!token) {
      res.status(401)
      res.json({ message: 'Invalid token' })
      return
    }
  }
  catch(e){
    res.status(401)
    res.json({ message: e.message })
  }
    
  })


app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const token = req.query.token as string

  console.log(id)

  try {
    const data = jwt.verify(token, SECRET_KEY) as JWTPayload
    const db = readDbFile()
    const todos = db.todos[data.username] || []

    if (!todos.find(todo => todo.id === id)) {
      res.status(404)
      res.json({
        message: 'This todo not found'
      })
      return
    }

    const newTodos = todos.filter(todo => todo.id !== id)
    db.todos[data.username] = newTodos
    fs.writeFileSync('db.json', JSON.stringify(db))

    res.json({
      message: 'Reset database successfully'
    })

  } catch(e) {
    res.status(401)
    res.json({ message: e.message })
  }
})

app.get('/me', (req, res) => {
  res.json({ "firstname":"Kantika" ,"lastname":"Khampan","code":"620610777" ,"gpa":"4.00 " })
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))