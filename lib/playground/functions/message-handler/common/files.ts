import type { S3Client                  } from "@aws-sdk/client-s3"
import type { ImageFormat               } from "@aws-sdk/client-bedrock-runtime"
import { v4                             } from "uuid"
import { basename, extname              } from "node:path"
import { GetObjectCommand               } from "@aws-sdk/client-s3"
import { getSignedUrl                   } from "@aws-sdk/s3-request-presigner"
import { createPresignedPost            } from "@aws-sdk/s3-presigned-post"

export interface File {

    file_name   : string,
    checksum    : string,
    format      : ImageFormat
}

const MAX_FILE_SIZE = 100 * 1000 * 1000  //100Mb
const UPLOAD_BUCKET_NAME = process.env["UPLOAD_BUCKET_NAME"]||''

export function generate_presigned_get(s3_client: S3Client, user_id: string, session_id: string, file_name: string) {

    file_name = basename(file_name)
    const url_encoded_key = encodeURI(file_name)
    const s3_key = `${user_id}/${session_id}/request/${url_encoded_key}`

    const get_object = new GetObjectCommand({

        'Bucket'    : UPLOAD_BUCKET_NAME,
        'Key'       : s3_key
    })

    const presigned_url = getSignedUrl(s3_client, get_object, { expiresIn: 15*60 })

    return {

        "file_name": file_name,
        "url": presigned_url,
    }
}

export async function generate_presigned_post(s3_client: S3Client, user_id: string, session_id: string, file_name: string, expiration=3600) {

    file_name = basename(file_name)
    const url_encoded_key = encodeURI(file_name)
    const file_id = v4()
    const object_name = `${user_id}/${session_id}/response/${file_id}/${url_encoded_key}`
    const url = await createPresignedPost(s3_client, {

        Bucket      : UPLOAD_BUCKET_NAME,
        Key         : object_name,
        Conditions  : [["content-length-range", 0, MAX_FILE_SIZE]],
        Expires     : expiration
    })

    return Object.assign(url, {

        file_id,
        file_name
    })
}

export function filter_inline_files(files: ReadonlyArray<File>, inline_files: ReadonlyArray<File>) {

    const checksums = new Set(inline_files.map(i => i.checksum))
    const supported = new Set([ "png", "jpg", "jpeg", "webp" ])

    return files
        .filter(i => !checksums.has(i.checksum))
        .map(i => Object.assign(i, { format : extname(i.file_name).replace('.', '').toLowerCase() }) as File )
        .map(i => Object.assign(i, { format : i.format as string === 'jpg' ? 'jpeg' : i.format }) as File )
        .filter(i => supported.has(i.format))
}

export async function get_inline_file_data(s3_client: S3Client, user_id: string, session_id: string, files_to_inline: ReadonlyArray<File>) {

    return Promise.all(

        files_to_inline.map(i => {

            const file_name = basename(i.file_name)
            const url_encoded_key = encodeURI(file_name)
            const s3_key = `${user_id}/${session_id}/request/${url_encoded_key}`
            const cmd = new GetObjectCommand({

                'Bucket'    : UPLOAD_BUCKET_NAME,
                'Key'       : s3_key
            })

            return s3_client
                .send(cmd)
                .then(resp => resp.Body?.transformToByteArray())
                .then(data => Object.assign(i, { data }))
        })
    )
}