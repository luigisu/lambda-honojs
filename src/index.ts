import {Hono} from 'hono';
import {handle, LambdaContext, LambdaEvent} from 'hono/aws-lambda';
import {createUpdateDbItem, deleteItem, getDbItem} from "./dynamoDb";
import {HTTPException} from 'hono/http-exception';

type Bindings = {
    event: LambdaEvent
    context: LambdaContext
};
const TableName = process.env.USER_DB;
const app = new Hono<{ Bindings: Bindings }>();

app.get('/user/:id?', async (c) => {
    try {
        const {id}: { id: string } = c.req.param()
        const {Items: users} = await getDbItem(TableName, id)
        return c.json(users)
    } catch (e) {
        throw new HTTPException(500, {message: 'Error on getting Users', cause: e})
    }

})

app.on(['POST', 'PUT'], 'user', async (c) => {
    const body = await c.req.json()
    const {id, email}: { id: string, email: string } = body
    if (!id || !email) throw new HTTPException(400, {
        message: 'Id and Email are required to create an user',
        cause: 'Missing parameter'
    })
    try {
        await createUpdateDbItem(TableName, body)
        return c.text(`User ${id} has been created or updated`)
    } catch (e) {
        throw new HTTPException(500, {message: 'Error on creating or updating users', cause: e})
    }

})


app.delete('/user/:id/:email', async (c) => {
    const {id, email}: { id: string, email: string } = c.req.param()
    if (!id || !email) throw new HTTPException(400, {
        message: 'Id and Email are required to delete an user',
        cause: 'Missing parameter'
    })
    try {
        await deleteItem(TableName, {id, email})
        return c.text(`User ${id} has been deleted`)
    } catch (e) {
        throw new HTTPException(500, {message: 'Error on deleting users', cause: e})
    }
})

app.onError((err, c) => {
    if (err instanceof HTTPException) {
        console.error(err)
        return err.getResponse()
    }
})
export const handler = handle(app)
