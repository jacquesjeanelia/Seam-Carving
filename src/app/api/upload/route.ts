import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { spawn } from "child_process"

export async function POST(request: NextRequest){
    try{
        const data = await request.formData()
        const image = data.get("image") as File
        const name = image.name.replace(/\.[^/.]+$/, "") + ".png" // Ensure the file is saved as PNG

        if (!image || !image.name) {
            console.error("No image file provided")
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        if (!image.type.startsWith("image/")) {
            console.error("Invalid file type:", image.type);
            return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, name);
        const bytes = await image.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));
        let { width, height } = await getImageDimensions(filePath);

        return NextResponse.json({
            success: true,
            filename: name,
            filePath: `/uploads/${name}`,
            originalDimensions: { width, height },
            message: "Image uploaded successfully"
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}

async function getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const script = `
import cv2
image = cv2.imread('${filePath.replace(/\\/g, '/')}')
if image is None:
    print("0,0")
else:
    height, width = image.shape[:2]
    print(f"{width},{height}")
        `
        
        // Use the full path to the Python executable in the virtual environment
        const command = process.platform === 'win32' 
            ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
            : path.join(process.cwd(), '.venv', 'bin', 'python')
        
        const pythonProcess = spawn(command, ['-c', script])

        let output = ''
        let errorOutput = ''
        
        pythonProcess.stdout.on('data', (data: Buffer) => {
            output += data.toString()
        })
        
        pythonProcess.stderr.on('data', (data: Buffer) => {
            errorOutput += data.toString()
        })

        pythonProcess.on('close', (code: number) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`)
                console.error(`Python stderr: ${errorOutput}`)
                resolve({ width: 0, height: 0 })
                return
            }
            
            const trimmedOutput = output.trim()
            
            if (!trimmedOutput || !trimmedOutput.includes(',')) {
                console.error('Invalid Python output format')
                resolve({ width: 0, height: 0 })
                return
            }
            
            const [widthStr, heightStr] = trimmedOutput.split(',')
            const width = parseInt(widthStr.trim(), 10)
            const height = parseInt(heightStr.trim(), 10)
            
            if (isNaN(width) || isNaN(height)) {
                console.error('Failed to parse dimensions from Python output')
                resolve({ width: 0, height: 0 })
                return
            }
            
            resolve({ width, height })
        })
    })    
}
