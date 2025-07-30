import { NextRequest, NextResponse } from "next/server";
import {writeFile, mkdir} from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest){
    try{
        const formData = await request.formData()
        const file = formData.get("image") as File

        if(!file || !file.name){
            return NextResponse.json({ error: "Image file is required." }, { status: 400 })
        }

        if(!file.type.startsWith("image/")){
            return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 })
        }

        console.log("Received file:", file.name)
        const uploadsDir = path.join(process.cwd(), 'uploads')
        if (!existsSync(uploadsDir)){
            await mkdir(uploadsDir, {recursive: true})
            console.log("Created uploads directory:", uploadsDir)
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const timestamp = Date.now()
        const fileExtension = path.extname(file.name)
        const fileName = `uploaded_image_${timestamp}-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        const filePath = path.join(uploadsDir, fileName)

        await writeFile(filePath, buffer)
        console.log("File saved to:", filePath)

        const { width, height} = await getImageDimensions(filePath)

        return NextResponse.json({
            success: true,
            message: "Image uploaded successfully.",
            fileName,
            filePath,
            dimensions: { width, height }
        })
    } catch (error) {
        console.error("Error in upload API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

async function getImageDimensions(filePath: string): Promise<{ width: number, height: number }> {
    return new Promise((resolve, reject) => {
        const { spawn } = require('child_process')

        const pythonCode = `
            import cv2
            import sys
            image = cv2.imread('${filePath.replace(/\\/g, '/')}')
            if image is not None:
                height, width = image.shape[:2]
                print(f"{width},{height}")
            else:
                print("0,0")
            `
        const pythonProcess = spawn('python', ['-c', pythonCode])

        let output = ''
        pythonProcess.stdout.on('data', (data: Buffer) => {
            output += data.toString()
        })

        pythonProcess.on('close', (code: number) => {
            if (code === 0){
                const [width, height] = output.trim().split(',').map(Number)
                resolve({ width: width || 0, height: height || 0 })
            }else{
                resolve({ width: 0, height: 0 })
            }
        })
    })
}
            
