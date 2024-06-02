import {
    DeleteItemCommand,
    DeleteItemCommandInput,
    DynamoDBClient,
    PutItemCommand,
    PutItemInput,
} from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient, GetCommandOutput, QueryCommand,
    ScanCommand,
    ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import {marshall} from '@aws-sdk/util-dynamodb';

const client: DynamoDBClient = new DynamoDBClient();
const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

export const getDbItem = async (TableName: string, id?: string): Promise<ScanCommandOutput | GetCommandOutput> => {
    if (id) {
        const param = {
            TableName,
            KeyConditionExpression: "#id = :id",
            ExpressionAttributeNames: {
                "#id": "id"
            },
            ExpressionAttributeValues: {
                ":id": id
            }
        };
        const command: QueryCommand = new QueryCommand(param);
        return await docClient.send(command);
    } else {
        const param = {
            TableName
        };
        const command: ScanCommand = new ScanCommand(param);
        return docClient.send(command);
    }
};
export const createUpdateDbItem = (TableName: string, Attributes: any): Promise<void> => {
    const Item: any = marshall({
        ...Attributes,
    });

    const params: PutItemInput = {
        TableName,
        Item
    };
    const command: PutItemCommand = new PutItemCommand(params)
    return docClient.send(command)
}

export const deleteItem = (TableName: string, Attributes: any): Promise<void> => {
    const Key: any = marshall({
        ...Attributes,
    });
    const params: DeleteItemCommandInput = {
        Key,
        TableName
    };
    const command: DeleteItemCommand = new DeleteItemCommand(params);
    return docClient.send(command);
}

