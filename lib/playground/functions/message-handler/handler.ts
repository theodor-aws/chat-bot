import type { Logger        } from "@aws-lambda-powertools/logger"
import type { Message,
              ContentBlock  } from "@aws-sdk/client-bedrock-runtime"
import { S3                 } from "@aws-sdk/client-s3"
import { BedrockRuntime     } from "@aws-sdk/client-bedrock-runtime"
import { MessageSender      } from "./common/sender"
import { system_messages    } from "./common/system"
import {

    type File,
    filter_inline_files,
    get_inline_file_data    } from "./common/files"

import {
    load_session,
    save_session,
    create_dynamodb_session } from "./common/session"
import { basename } from "path"

const THROTTLE_DELAY    = 3000
const AWS_REGION        = process.env["AWS_REGION"]
const BEDROCK_REGION    = process.env["BEDROCK_REGION"]||''
const BEDROCK_MODEL     = process.env["BEDROCK_MODEL"]||''
const GUARDRAIL_ID      = process.env["GUARDRAIL_ID"]||undefined
const GUARDRAIL_VERSION = process.env["GUARDRAIL_VERSION"]||'DRAFT'

const s3_client         = new S3();
const bedrock           = new BedrockRuntime({

    'region': BEDROCK_REGION || AWS_REGION || undefined
})





export async function handle_message(logger: Logger, connection_id: string, user_id: string, body: Record<string, any>) {

    logger.info(`Received message for ${user_id}`)
    logger.info("Received message body", { body })
    const sender = new MessageSender(connection_id)

    try {

        const session_id = body.session_id
        const event_type = body.event_type

        if (!session_id) {

            throw new Error("Session ID is required")
        }

        if (event_type === "HEARTBEAT") {

            logger.info('HEARTBEAT')
            sender.send_heartbeat()
        }

        else if (event_type === "CONVERSE") {

            logger.info('CONVERSE')

            const message   = body.message
            const files     = body.files || []
            const [new_session, session] = await load_session(s3_client, user_id, session_id)

            logger.info('CONVERSE: session', { new_session, session })

            const converse_messages = session.messages as Array<Message>
            const inline_files      = session.inline_files as Array<File>
            const files_to_inline   = filter_inline_files(files, inline_files)
                  inline_files.push(...files_to_inline)

            const inline_files_data = await get_inline_file_data(

                s3_client, user_id, session_id, files_to_inline
            )

            const content = [] as Array<ContentBlock>

            if (message) {

                content.push({ "text": message })
            }

            if (inline_files_data) {

                content.push(

                    ...inline_files_data
                    .filter(i => i.data)
                    .map(i => ({

                        image: {

                            format: i.format,
                            source: { bytes: i.data! }
                        }
                    }))
                )
            }

            converse_messages.push({

                role    : "user",
                content : content,
            })

            const finish = converse_make_request_stream(
                logger,
                sender,
                user_id,
                session_id,
                converse_messages,
                files,
            )

            if (new_session) {

                create_dynamodb_session(user_id, session_id, message)
            }

            save_session(s3_client, user_id, session_id, session)
            sender.send_loop(finish)
        }

        else {

            throw new Error(`Unknown event type: ${event_type}`)
        }
    }

    catch(e) {

        logger.error(`Error processing message`, { exception: e })

        if (e) {

            if (typeof e === 'object') {

                sender.send_error('message' in e ? e['message'] : e.toString() || `${e}`)
            }
        }
    }

    return {

        statusCode  : 200,
        body        : JSON.stringify({ ok: true })
    }
}





async function converse_make_request_stream(
    logger              : Logger, 
    sender              : MessageSender,
    user_id             : string,
    session_id          : string,
    converse_messages   : Array<Message>,
    files               : Array<File>
){
    const file_names    = files.map(i => basename(i.file_name))
    const system        = system_messages(file_names)    
    const max_retries   = 10
    let   num_retries   = 0

    while (num_retries < max_retries) {

        try {

            logger.info(`CONVERSE: attempt ${num_retries} out of ${max_retries}`, { converse_messages })

            const guardrailConfig = GUARDRAIL_ID ? {

                guardrailConfig : {

                    guardrailIdentifier : GUARDRAIL_ID,
                    guardrailVersion    : GUARDRAIL_VERSION
                }

            } : undefined;

            const streaming_response = await bedrock.converseStream({

                modelId     : BEDROCK_MODEL,
                system      : system,
                messages    : converse_messages,
                inferenceConfig : {
                    maxTokens   : 4096,
                    temperature : 0.5
                },
                ...guardrailConfig
            })

            if (streaming_response.stream) {

                let text: string = ''

                for await (const i of streaming_response.stream) {

                    logger.info("Streaming response: Chunk", { chunk: i })

                    if (i.contentBlockDelta) {

                        const t = i.contentBlockDelta.delta?.text

                        if (t) {

                            sender.send_text(text)
                            text += t
                        }
                    }
                }

                converse_messages.push({ role: 'assistant', content: [{ text }] })
                return true
            }

            logger.info("Streaming response: No Stream")
            return true
        }

        catch(e) {

            num_retries += 1
            logger.error("Bedrock ConverseStream Error", { exception: e, num_retries, max_retries })
            await new Promise(r => setTimeout(r, THROTTLE_DELAY))
        }
    }

    return true
}