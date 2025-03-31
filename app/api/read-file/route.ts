import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    // Read file using smbclient
    const { stdout } = await execAsync(
      `smbclient "//192.168.40.145/OBS Multi" -U guest% -c "get src/App.svelte -"`
    )

    return NextResponse.json({ content: stdout })
  } catch (error) {
    console.error("Error reading file:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

