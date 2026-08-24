import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";


const prisma = new PrismaClient();


async function main(){


const password = await bcrypt.hash(
"admin123",
10
);


await prisma.user.create({

data:{

nama:"Administrator",

email:"admin@kamoo.id",

password,

role:"SUPERADMIN"

}

});


console.log("Admin created");


}


main()
.finally(()=>prisma.$disconnect());