import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { spawn } from "child_process"
import { Readable } from "stream"
import { text } from "stream/consumers"


export async function POST(request: NextRequest) {
    const data = await request.json()
    const { filename, filePath, oldHeight, oldWidth, newHeight, newWidth, algorithm } = data
    console.log(`File path: ${filePath}`);

    if (!filename || !filePath || !oldHeight || !oldWidth || !newHeight || !newWidth || !algorithm) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Convert the relative web path to an absolute file system path
    const absoluteFilePath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
    console.log(`Absolute file path: ${absoluteFilePath}`);

    if (!['greedy', 'dp'].includes(algorithm)) {
        return NextResponse.json({ error: "Invalid algorithm specified" }, { status: 400 });
    }

    if ( newHeight <= 0 || newWidth <= 0 || oldHeight <= 0 || oldWidth <= 0) {
        return NextResponse.json({ error: "Invalid dimensions provided" }, { status: 400 });
    }

    if ( newHeight > oldHeight || newWidth > oldWidth) {
        return NextResponse.json({ error: "New dimensions must be less than or equal to original dimensions" }, { status: 400 });
    }

    const stream = new ReadableStream({
        start(controller) {
            const send = (obj: unknown) => controller.enqueue(JSON.stringify(obj));

            const command = process.platform === 'win32' 
            ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe') 
            : path.join(process.cwd(), '.venv', 'bin', 'python');
            
            const scriptPath = path.join(process.cwd(), 'python', '__init__.py');
            console.log(`Running: ${command} ${scriptPath} ${absoluteFilePath} ${newWidth} ${newHeight} ${algorithm}`);
            const pythonProcess = spawn(command, [scriptPath, absoluteFilePath, newWidth.toString(), newHeight.toString(), algorithm]);


            send({ 
                type: 'progress',
                progress: 0,
                message: 'Starting...',
            });

            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Progress:')) {
                    const progressMatch = output.match(/Progress:\s+(\d+)%/);
                    if (progressMatch) {
                        const progress = progressMatch[1];
                        send({ 
                            type: 'progress',
                            progress: progress,
                            message: `Processing... ${progress}%`,
                        });
                    }
                } else {
                    send({ 
                        type: 'log',
                        message: output.trim(),
                    });
                }
            });

            let errorOutput = '';
            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on('close', async (code) => {
                if (code !== 0) {
                    send({ 
                        type: 'error',
                        message: `Process exited with code ${code}. Error: ${errorOutput}`,
                    });
                    controller.close();
                    return;
                }

                const outputDir = path.join(process.cwd(), 'public', 'outputs', 'processed-images');
                const name = filename.split('.')[0];

                if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true });

                const webPaths = {
                    processedImage: `/outputs/processed-images/${name}_resized_image.png`,
                };

                send({ 
                    type: 'complete',
                    message: 'Processing complete',
                    paths: webPaths,
                    dimensions: {
                        originalWidth: oldWidth,
                        originalHeight: oldHeight,
                        newWidth: newWidth,
                        newHeight: newHeight,
                    },
                    algorithm:algorithm,
                    filename: name
                });

                controller.close();
            });
        }
    });
    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        },
    });
}