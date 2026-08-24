import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";


const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "kamoo-secret"
);





export async function createSession(
data:any
){


const token = await new SignJWT(data)

.setProtectedHeader({

alg:"HS256"

})

.setIssuedAt()

.setExpirationTime("7d")

.sign(secret);





const cookieStore = await cookies();



cookieStore.set(

"session",

token,

{

httpOnly:true,

secure:process.env.NODE_ENV === "production",

sameSite:"lax",

maxAge:60 * 60 * 24 * 7,

path:"/"

}

);



}









export async function getSession(){


const cookieStore = await cookies();


const token =
cookieStore.get("session")?.value;



if(!token){

return null;

}



try{


const {payload} =
await jwtVerify(

token,

secret

);



return payload;



}catch{


return null;


}


}








export async function logout(){


const cookieStore =
await cookies();


cookieStore.delete(
"session"
);


}