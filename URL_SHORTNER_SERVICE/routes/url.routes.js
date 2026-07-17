import express from 'express'
import { shortenPostRequestBodySchema } from '../validation/request.validation.js';
import { db } from '../db/index.js';
import { urlsTable } from '../models/url.model.js';
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';
import { nanoid } from 'nanoid';
import { eq,and } from 'drizzle-orm';
import {createShortURL} from '../services/url.service.js'
const router=express.Router();



router.post('/shorten',ensureAuthenticated,async  (req,res)=>{
   
   const validationResult=await shortenPostRequestBodySchema.safeParseAsync(req.body)

    if(validationResult.error){
        return res.status(400).json({ error:validationResult.error})
    }
   
    const {url,code}=validationResult.data;

       const  shortCode= code ?? nanoid(6)
    
   const result= await createShortURL({
    shortCode,
    targetURL:url,
    userID:req.user.id,
   })
     
     return res.status(201).json({id:result.id,shortCode:result.shortCode,targetURL:result.targetURL});
})


router.get('/codes',ensureAuthenticated,async(req,res)=>{
    const codes=await db.select().from(urlsTable).where(eq(urlsTable.userID,req.user.id));
    return res.json({codes});
})

router.delete('/codes/:id',ensureAuthenticated,async(req,res)=>{
    const id=req.params.id;

    const result=await db.delete(urlsTable).where(and(eq(urlsTable.id,id),eq(urlsTable.userID,req.user.id)));
    return res.status(204).json({deleted:"success"});
})

router.get('/:shortCode',async(req,res)=>{
     const code=req.params.shortCode;
     const [result]=await db
     .select({targetURL: urlsTable.targetURL})
     .from(urlsTable)
     .where(eq(urlsTable.shortCode,code));

     if(!result){
        return res.status(404).json({error:'invalid url'})
     }

     return res.redirect(result.targetURL);

})

export default router