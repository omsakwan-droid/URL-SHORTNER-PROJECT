import express from 'express'
import {db} from '../db/index.js'
import { usersTable } from '../models/user.model.js'


import { signupPostRequestBodySchema,loginPostRequestBodySchema } from '../validation/request.validation.js'
import { hashPasswordWithSalt } from '../utils/hash.js'
import { getUserByEmail } from '../services/user.service.js'
import jwt from 'jsonwebtoken'
import { createdtoken } from '../utils/token.js'


const router=express.Router()

router.post('/signup',async(req,res)=>{
   const validationResult=await signupPostRequestBodySchema.safeParseAsync(req.body);

   if(validationResult.error){
    return res.status(400).json({error:validationResult.error.format()});
   }

   const {firstname,lastname,email,password}=validationResult.data;




    // const [existinguser]=await db
    // .select({id:usersTable.id})
    // .from(usersTable)
    // .where(eq(usersTable.email,email));
     
    const existingUser= await getUserByEmail(email)


    if(existingUser){
        return res.status(400).json({error:`user with this email:${email} already exist`});
    }
     
    const {salt,password:hashedPassword}=hashPasswordWithSalt(password);

    const [user]=await db.insert(usersTable).values({
        firstname,
        lastname,
        email,
        password:hashedPassword,
        salt,
    }).returning({id:usersTable.id});
    
    return res.status(201).json({data:{userId:user.id}})

})

router.post('/login',async(req,res)=>{
   const validationResult=await loginPostRequestBodySchema.safeParseAsync(req.body);

   if(validationResult.error){
    return res.status(400).json({error:validationResult.error.format()});
   }

   const {email,password}=validationResult.data;

   const user=await getUserByEmail(email);

   if(!user){
    return res.status(404).json({error:`user with email ${email} doesn't exist`});
   }
   
   const {password: hashedPassword}=hashPasswordWithSalt(password,user.salt);

   if(hashedPassword!==user.password){
     return res.status(400).json({error:'invalid password'});
   }

//    const token=jwt.sign({id:user.id},process.env.JWT_SECRET);
     
     const token=await createdtoken({id:user.id});

   return res.json({token})

})


export default router