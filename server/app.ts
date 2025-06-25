import express from "express"

const app = express()

// #TODO only use with express api not supported by next
// app.use(express.json({ limit: '16kb' }))
// app.use(express.urlencoded({ extended: false, limit: '20kb' }))

export { app }