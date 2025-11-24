import z, { ZodObject } from "zod"
export interface userZod extends ZodObject {
    name:z.ZodString
    email:z.ZodEmail
    password:z.ZodString
}