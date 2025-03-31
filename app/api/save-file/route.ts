import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { content } = data

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 })
    }

    // Create a temporary file
    const tempFile = path.join(os.tmpdir(), "App.svelte")
    fs.writeFileSync(tempFile, content)

    // Upload the file using smbclient
    await execAsync(
      `smbclient "//192.168.40.145/OBS Multi" -U guest% -c "put ${tempFile} src/App.svelte"`
    )

    // Clean up the temporary file
    fs.unlinkSync(tempFile)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving file:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

