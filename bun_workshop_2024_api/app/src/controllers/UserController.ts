import { PrismaClient } from '@prisma/client';
import { password } from 'bun';
const prisma = new PrismaClient();

export const UserController = {
    signIn: async ({ body, jwt }: {
        body: {
            username: string;
            password: string;
        }; jwt: any

    }) => {
        try {
            const user = await prisma.user.findUnique(
                {
                    select: { id: true, username: true, level: true },
                    where: { username: body.username, password: body.password, status: "active" }
                }

            )
            if (!user) {
                return { message: "Invalid username or password" }
            }
            const token = await jwt.sign(user);
            return { user, token }
        } catch (error) {
            return error;
        }
    },
    update: async ({ body, request, jwt }: {
        body: {
            username: string;
            password: string;
        }; request: any; jwt: any
    }) => {
        try {
            const headers = request.headers.get("Authorization");
            const token = headers?.split(" ")[1];
            const payload = await jwt.verify(token);
            //console.log(payload);
            //console.log(body);
            // console.log("------------------------------");
            const id = payload.id;
            const oldUser = await prisma.user.findUnique({ where: { id } });
            //console.log(oldUser);
            const newData = {
                username: body.username,
                password: (body.password==''? null: body.password) ?? oldUser?.password
            }
            //console.log(newData);
            await prisma.user.update({
                where: { id },
                data: newData
            });
            return { message: "success" }

        } catch (error) {
            console.log(error);
            return error;
        }
    },
    list: async () => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    level: true,
                    section: {
                        select: {
                            name: true,
                            id: true,
                            department: {
                                select: {
                                    name: true,
                                    id: true
                                }
                            }
                        }
                    }
                },
                where: {
                    status: "active"
                },
                orderBy: {
                    id: "desc"
                }
            });

            return users;
        } catch (error) {
            return error;
        }
    },
    create: async ({ body }: {
        body: {
            username: string;
            password: string;
            level: string;
            sectionId: number;
        }
    }) => {
        try {
            await prisma.user.create({
                data: body
            })

            return { message: "success" }
        } catch (error) {
            return error;
        }
    },
    updateUser: async ({ body, params }: {
        body: {
            username: string;
            password: string;
            level: string;
            sectionId: number;
        },
        params: {
            id: string;
        }
    }) => {
        try {
            const oldUser = await prisma.user.findUnique({
                select: { password: true },
                where: { id: parseInt(params.id) }
            })

            const newData = {
                username: body.username,
                password: body.password == '' ? oldUser?.password : body.password,
                level: body.level,
                sectionId: body.sectionId 
            }

            await prisma.user.update({
                where: { id: parseInt(params.id) },
                data: newData
            })

            return { message: "success" }
        } catch (error) {
            return error;
        }
    },
    remove: async ({ params }: {
        params: {
            id: string;
        }
    }) => {
        try {
            await prisma.user.update({
                where: { id: parseInt(params.id) },
                data: { status: "inactive" }
            })
            return { message: "success" }
        } catch (error) {
            return error;
        }
    },
        listEngineer: async () => {
        try {
            const engineers = await prisma.user.findMany({
                where: {
                    level: "engineer",
                    status: "active"
                },
                orderBy: {
                    username: "asc"
                }
            });

            return engineers;
        } catch (error) {
            return error;
        }
    },
     level: async ({ jwt, request }: {
        jwt: any,
        request: any
    }) => {
        try {
            const headers = request.headers.get("Authorization");
            const token = headers?.split(" ")[1];
            const payload = await jwt.verify(token);
            const id = payload.id;
            const user = await prisma.user.findUnique({
                where: {
                    id: id
                },
                select: {
                    level: true
                }
            });

            return user?.level;
        } catch (error) {
            return error;
        }
    }
};