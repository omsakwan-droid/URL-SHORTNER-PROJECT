import { createHmac,randomBytes } from 'node:crypto'

export function hashPasswordWithSalt(password,usersalt=undefined){
    const salt= usersalt ?? randomBytes(256).toString('hex')
    const hashedpassword=createHmac('sha256',salt)
    .update(password)
    .digest('hex');
    return {salt, password:hashedpassword};
}