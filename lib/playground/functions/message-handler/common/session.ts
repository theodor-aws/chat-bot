import { type S3, S3ServiceException } from "@aws-sdk/client-s3"
import { DynamoDB } from "@aws-sdk/client-dynamodb"

const SESSION_TABLE_NAME    = process.env["SESSION_TABLE_NAME"]||""
const SESSION_BUCKET_NAME   = process.env["SESSION_BUCKET_NAME"]||""
const dynamodb              = new DynamoDB()





export async function load_session(s3: S3, user_id: string, session_id: string) {

    const key = `${user_id}/${session_id}/session.jsonb`

    try {

        const response = await s3.getObject({

            Bucket  : SESSION_BUCKET_NAME,
            Key     : key
        })

        const body = await response.Body?.transformToString()

        if (body) {

            const data = JSON.parse(body)
            return [ false, data ]
        }
    }

    catch(e) {

        if (e instanceof S3ServiceException) {

            if (e.name === 'NoSuchKey') {                

                console.log(e.name, e.message)
            }
        }

        else {

            console.error(e)
            throw e
        }
    }

    return [ true, {

        "session_id"    : session_id,
        "messages"      : [],
        "tool_extra"    : {},
        "inline_files"  : [],
    }]
}



export async function save_session(s3_client: S3, user_id: string, session_id: string, session: Record<string,any>){

    const key = `${user_id}/${session_id}/session.jsonb`
    const body = JSON.stringify(session)
    return s3_client.putObject({

        Bucket: SESSION_BUCKET_NAME,
        Key   : key,
        Body  : body
    })
}



export function create_dynamodb_session(user_id: string, session_id: string, title: string = "") {

    const now = new Date()
    const response = dynamodb.putItem({

        TableName   : SESSION_TABLE_NAME,
        Item        : {

            "userId"    : { S: user_id    },
            "sessionId" : { S: session_id },
            "entityId"  : { S: `${session_id}/${now.getTime()}` },
            "title"     : { S: title.substring(0, 128) },
            "created"   : { S: now.toISOString() }
        }
    })

    console.log(response)
    return response
}