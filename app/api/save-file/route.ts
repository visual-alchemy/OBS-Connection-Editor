import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

const execAsync = promisify(exec)

// Helper function to log detailed debugging information
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG ${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

const SMB_ADDRESS = process.env.SMB_ADDRESS || "192.168.40.145"
const SMB_SHARE_NAME = process.env.SMB_SHARE_NAME || "OBS Multi"
const SMB_USERNAME = process.env.SMB_USERNAME || "guest"
const SMB_PASSWORD = process.env.SMB_PASSWORD || "" // guest% means no password
const SMB_FILE_PATH = process.env.SMB_FILE_PATH || "src/App.svelte"

export async function POST(request: NextRequest) {
  try {
    logDebug("Save file request received")

    const data = await request.json()
    const { content } = data

    if (!content) {
      logDebug("Missing content in request")
      return NextResponse.json({ error: "Missing content" }, { status: 400 })
    }

    logDebug(`Content received (first 100 chars): ${content.substring(0, 100)}...`)

    // Create a temporary file
    const tempFile = path.join(os.tmpdir(), "App.svelte")
    fs.writeFileSync(tempFile, content)
    logDebug(`Temporary file created at: ${tempFile}`)

    try {
      // Verify file was written correctly
      const writtenContent = fs.readFileSync(tempFile, "utf8")
      logDebug(`Temp file content length: ${writtenContent.length} chars`)
    } catch (readErr) {
      logDebug(`Error reading temp file: ${(readErr as Error).message}`)
    }

    logDebug("Attempting to upload file to SMB share")

    const smbAuth = SMB_PASSWORD ? `-U ${SMB_USERNAME}%${SMB_PASSWORD}` : `-U ${SMB_USERNAME}%`
    const smbSharePath = `//${SMB_ADDRESS}/${SMB_SHARE_NAME}`

    // Use a more verbose command to get better error messages
    const smbCommand = `smbclient "${smbSharePath}" ${smbAuth} -d 3 -c "put ${tempFile} ${SMB_FILE_PATH}"`;
    logDebug(`SMB command: ${smbCommand}`)

    try {
      // Upload the file using smbclient with debug level 3
      const { stdout, stderr } = await execAsync(smbCommand)

      logDebug("SMB command executed", { stdout, stderr })

      // If stdout contains specific strings that indicate success
      if (stdout.includes("putting file") || !stderr) {
        logDebug("File appears to have been uploaded successfully")
      } else {
        logDebug("Warning: SMB command completed but may not have succeeded", { stdout, stderr })
      }
    } catch (smbError) {
      // Log detailed error but keep trying alternative methods
      logDebug(`SMB error encountered: ${(smbError as Error).message}`)
      logDebug("Error details", smbError)

      // Try an alternative approach - using simple command without debug
      try {
        logDebug("Trying alternative SMB command")
        await execAsync(
          `smbclient "${smbSharePath}" ${smbAuth} -c "put ${tempFile} ${SMB_FILE_PATH}"`,
        )
        logDebug("Alternative SMB command completed")
      } catch (altError) {
        logDebug(`Alternative SMB approach also failed: ${(altError as Error).message}`)
        throw altError // Re-throw for outer catch
      }
    }

    // Clean up the temporary file
    try {
      fs.unlinkSync(tempFile)
      logDebug("Temporary file cleaned up")
    } catch (unlinkErr) {
      logDebug(`Warning: Could not delete temporary file: ${(unlinkErr as Error).message}`)
      // Non-fatal error, continue
    }

    logDebug("Save file operation completed successfully")
    return NextResponse.json({
      success: true,
      message: "File saved to SMB share",
    })
  } catch (error) {
    const errorMsg = (error as Error).message
    logDebug(`Error saving file: ${errorMsg}`, error)
    console.error("Error saving file:", error)

    return NextResponse.json(
      {
        error: errorMsg,
        stack: (error as Error).stack,
        details: "See server logs for more information",
      },
      { status: 500 },
    )
  }
}
