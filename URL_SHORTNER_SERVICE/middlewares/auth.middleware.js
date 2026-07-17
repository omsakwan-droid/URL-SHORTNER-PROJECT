import { validateUserToken } from "../utils/token.js";
/**
 * 
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

 export function authenticationmiddleware(req,res,next){
    const authheader=req.headers["authorization"]

    if(!authheader) return next();

    if(!authheader.startsWith('Bearer')) 
        return res.status(400).json({error:'authorization header must start with bearer'})
      
    const [_,token]=authheader.split(' ')
    const payload=validateUserToken(token);

    req.user=payload;
    next();
}


export function ensureAuthenticated(req,res,next){
    
    if(!req.user || !req.user.id) return res.status(401).json({error:`you must be logged in`});
    
        next();
}