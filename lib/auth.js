import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const COOKIE='anova_session';
const secret=()=>new TextEncoder().encode(process.env.AUTH_SECRET || 'anova-local-development-secret-change-me');
export async function createSession(user){
 const token=await new SignJWT({sub:user.id,role:user.role,name:`${user.firstName} ${user.lastName}`,email:user.email}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(secret());
 const store=await cookies(); store.set(COOKIE,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*8});
}
export async function getSession(){try{const store=await cookies();const token=store.get(COOKIE)?.value;if(!token)return null;return (await jwtVerify(token,secret())).payload}catch{return null}}
export async function clearSession(){const store=await cookies();store.set(COOKIE,'',{httpOnly:true,path:'/',maxAge:0})}
