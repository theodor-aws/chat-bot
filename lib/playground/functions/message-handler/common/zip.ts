import { gzip, gunzip, type InputType } from "node:zlib"





export async function zip(data: InputType) {

    return new Promise<Buffer>((resolve, reject) => {

        gzip(data, (err, result) => {

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

        gunzip(data, (err, result) => {

            if (err) {

                reject(err)
            }
            
            else {

                resolve(result)
            }
        })
    })
}