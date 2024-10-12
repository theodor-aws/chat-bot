import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi"
import { v4 } from "uuid"

const MAX_PAYLOAD_SIZE = 24 * 1024  //24 KB
const api_gateway_management_api = new ApiGatewayManagementApi({

    endpoint: process.env["WEBSOCKET_API_ENDPOINT"]||''
})





const encoder = new TextEncoder()
const decoder = new TextDecoder()
let sequence_idx = 0


export class MessageSender {

    private connection_id: string

    constructor (connection_id: string) {

        this.connection_id = connection_id
    }

    async send_data(data: Record<string, any>) {

        sequence_idx += 1
        data["sequence_idx"]= sequence_idx

        const frame_id      = v4()
        const message_json  = JSON.stringify(data)
        const message_bytes = encoder.encode(message_json)
        const total_length  = message_bytes.length
        const num_frames    = Math.ceil(total_length / MAX_PAYLOAD_SIZE)

        return Promise.all(

            new Array(num_frames).fill(0)
                .map((_, n) => ({

                    id      : n+1,
                    start   : n*MAX_PAYLOAD_SIZE,
                    end     : (n+1)*MAX_PAYLOAD_SIZE,
                    isLast  : (n+1) === num_frames
                }))

                .map(i => JSON.stringify({

                    frame_id    : frame_id,
                    num_frames  : num_frames,
                    frame_idx   : i.id,
                    last        : i.isLast,
                    data        : decoder.decode(message_bytes.subarray(i.start, i.end))
                }))

                .map(i =>

                    api_gateway_management_api.postToConnection({

                        ConnectionId: this.connection_id,
                        Data        : i
                    })
                )
            )
    }
   
    send_error(error: any) {

        return this.send_data(

            { "event_type": "ERROR", "error": error }
        )
    }

    send_heartbeat(payload: any = null) {

        return this.send_data(

            { "event_type": "HEARTBEAT", "payload": payload }
        )
    }

    send_loop(finish: any){

        return this.send_data(

            { "event_type": "LOOP", "finish": finish }
        )
    }

    send_text(text: any){

        return this.send_data(

            { "event_type": "TEXT_CHUNK", "text": text }
        )
    }
}