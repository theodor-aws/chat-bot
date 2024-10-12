import type { Handler       } from "aws-lambda"
import { Logger             } from "@aws-lambda-powertools/logger"
import { handle_message     } from "./handler"

const logger = new Logger({

    serviceName: 'chatbot-message-handler',
})

export const handler: Handler = async (event, context) => {

    const event_type    = event["requestContext"]["eventType"]
    const connection_id = event["requestContext"]["connectionId"]
    const user_id       = event["requestContext"]["authorizer"]["username"]

    logger.addContext(context)
    logger.appendKeys({ connection_id })

    if (event_type === "MESSAGE") {

        const message = JSON.parse(event["body"])
        return handle_message(logger, connection_id, user_id, message)
    }

    return { "ok": true }
}