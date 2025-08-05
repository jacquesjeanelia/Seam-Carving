import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { spawn } from "child_process"


export async function POST(request: NextRequest) {
    try{
        const data = await request.json()
        const { filename, oldWidth, oldHeight,newWidth, newHeight, algorithm } = data
        if (!filename || !newWidth || !newHeight || !algorithm) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        if (!["greedy", "dp"].includes(algorithm)) {
            return NextResponse.json({ error: "Invalid algorithm specified" }, { status: 400 })
        }

        if (newWidth <= 0 || newHeight <= 0 || !Number.isInteger(newWidth) || !Number.isInteger(newHeight)) {
            return NextResponse.json({ error: "Width and Height must be positive integers" }, { status: 400 })
        }

        if ( newWidth > oldWidth || newHeight > oldHeight) {
            return NextResponse.json({ error: "New dimensions must be less than or equal to original dimensions" }, { status: 400 })
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const outputDir = path.join(process.cwd(), "public", "outputs")
        if (!existsSync(outputDir)) {
            await mkdir(outputDir, { recursive: true })
        }

        const filePath = path.join(uploadDir, filename)
        if (!existsSync(filePath)) {
            return NextResponse.json({ error: "Image file does not exist" }, { status: 404 })
        }

        const pythonScript = path.join(process.cwd(), "python", "__init__.py")
        const output = await callPythonScript(pythonScript, filePath, newWidth, newHeight, algorithm)

        return NextResponse.json({
            success: true,
            message: "Image processed successfully",
            processedPath: `/outputs/${filename}`,
            /*             processedPath: `/outputs/processed-images/${filename}`,
            energyMapPath: `/outputs/energy-maps/energy_map.png`,
            seamVisualizationPath: `/outputs/seam-visualization/seams.png`, */
            output: output,
            newDimensions: { newWidth, newHeight },
            algorithm: algorithm
        })
    } catch (error) {
        console.error("Error processing image:", error)
        return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
    }
}

function callPythonScript(scriptPath: string, filePath: string, newWidth: number, newHeight: number, algorithm: string) {
    return new Promise((resolve, reject) => {
        const command = process.platform === 'win32' 
        ? path.join(process.cwd(), ".venv", "Scripts", "python.exe") 
        : path.join(process.cwd(), ".venv", "bin", "python")
        
        const pythonPath = path.join(process.cwd(), "python", "__init__.py")
        const pythonProcess = spawn(command, [pythonPath, filePath, newWidth.toString(), newHeight.toString(), algorithm])
        console.log(`Command: ${command}`)
        console.log(`Script Path: ${pythonPath}`)
        console.log(`File Path: ${filePath}`)
        console.log(`New Width: ${newWidth}, New Height: ${newHeight}, Algorithm: ${algorithm}`)
        
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
                reject(new Error(`Python script exited with code ${code}: ${errorOutput}`))
            }
            resolve(output)
        })
    })
}
