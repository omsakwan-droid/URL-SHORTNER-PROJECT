import jwt  from "jsonwebtoken";
import { usertokenschema } from "../validation/token.validation.js";
import { error } from "node:console";
const JWT_SECRET=process.env.JWT_SECRET;

export async function createdtoken(payload) {
    const validationResult=await usertokenschema.safeParseAsync(payload)

    if(validationResult.error) throw new Error(validationResult.error.message)
       
    const payloadvalidated=validationResult.data;
    const token=jwt.sign(payloadvalidated,JWT_SECRET);
    return token;
} 

export function validateUserToken(token){
    try {
        const payload=jwt.verify(token,JWT_SECRET);
        return payload
    } catch (error) {
        return null;
    }
}