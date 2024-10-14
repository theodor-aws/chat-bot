import { deflate, inflate, type InputType } from "node:zlib"





export async function zip(data: InputType) {

    return new Promise<Buffer>((resolve, reject) => {

        deflate(data, (err, result) => {

            if (err) {

                reject(err)
            }
            
            else {

                resolve(result)
            }
        })
    }) 
}





export async function unzip(data: InputType) {

    return new Promise<Buffer>((resolve, reject) => {

        inflate(data, (err, result) => {

            if (err) {

                reject(err)
            }
            
            else {

                resolve(result)
            }
        })
    })
}