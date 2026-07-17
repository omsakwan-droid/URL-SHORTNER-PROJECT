import express from 'express'
import userrouter from './routes/user.routes.js'
import urlrouter from './routes/url.routes.js'
import { authenticationmiddleware } from './middlewares/auth.middleware.js'

const PORT=process.env.PORT ?? 8000

const app=express()
app.use(express.json());

// Allow the React frontend (running on a different port) to call this API
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET,POST,DELETE,PUT,OPTIONS');
    res.header('Access-Control-Allow-Headers','Content-Type,Authorization');
    if(req.method==='OPTIONS') return res.sendStatus(204);
    next();
})

app.use(authenticationmiddleware);

app.get('/',async(req,res)=>{
    return res.json({status:`server is up`})
})


 app.use(urlrouter);
app.use('/user',userrouter)

app.listen(PORT,()=>{
    console.log(`server is runnning on PORT:${PORT}`)
})