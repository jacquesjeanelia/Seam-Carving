import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path, { parse } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
    try {
        
        const data = await request.json()

        const width = parseInt(data.width)
        const height = parseInt(data.height)
        const algorithm = data.algorithm || "greedy"

        if (!width || !height){
            return NextResponse.json({ error: "Width and height are required." }, { status: 400 })
        }

        const scriptPath = path.join(process.cwd(), 'python', 'seam_carver.py')

        if (!existsSync(scriptPath)) {
            return NextResponse.json({ error: "Python script not found." }, { status: 500 })
        }

        const output = await callPythonScript(scriptPath, width, height, algorithm)

        return NextResponse.json({
            success: true,
            message: "Seam carving completed successfully.",
            output: output,
            parameters: { width, height, algorithm }
        })
    } catch (error) {
        console.error("Error in seam carving API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

function callPythonScript(scriptPath: string, width: number, height: number, algorithm: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [scriptPath, width.toString(), height.toString(), algorithm])

        let output = ''
        let errorOutput = ''

        pythonProcess.stdout.on('data', (data)=>{
            const message = data.toString()
            console.log("Python output:", message);
            output += message
        })

        pythonProcess.stderr.on('data', (data)=>{
            const errorMessage = data.toString()
            console.error("Python error output:", errorMessage);
            errorOutput += errorMessage
        })

        pythonProcess.on('close', (code)=>{
            if(code === 0){
                resolve(output)
            }
            else{
                reject(new Error(`Python script exited with code ${code}: ${errorOutput}`))
            }
        })

    })
}
