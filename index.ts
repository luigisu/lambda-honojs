import {Hono} from 'hono'
import {handle, LambdaContext, LambdaEvent} from 'hono/aws-lambda'
import {createUpdateDbItem, deleteItem, getDbItem} from "./dynamoDb";

type Bindings = {
    event: LambdaEvent
    context: LambdaContext
}
const TableName = process.env.USER_DB
const app = new Hono<{ Bindings: Bindings }>()

app.get('/user/:id?', async (c) => {
    const {id}: { id: string } = c.req.param()
    const {Items: users} = await getDbItem(TableName, id)
    return c.json({
        id, users
    })
})

app.on(['POST', 'PUT'], 'user', async (c) => {
    const body = await c.req.json()
    await createUpdateDbItem(TableName, body)
    return c.json({})
})


app.delete('/user/:id/:email', async (c) => {
    const {id, email}: { id: string, email: string } = c.req.param()
    await deleteItem(TableName, {id, email})
    return c.json({})
})

export const handler = handle(app)
