import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

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

export async function GET(request: NextRequest) {
  try {
    logDebug("SMB connection test requested")

    const smbAuth = SMB_PASSWORD ? `-U ${SMB_USERNAME}%${SMB_PASSWORD}` : `-U ${SMB_USERNAME}%`
    const smbSharePath = `//${SMB_ADDRESS}/${SMB_SHARE_NAME}`

    // Test 1: Can we list shares?
    logDebug("Test 1: Listing shares")
    try {
      const { stdout: listShares, stderr: listSharesErr } = await execAsync(
        `smbclient -L //${SMB_ADDRESS} -N`,
      )

      logDebug("SMB share listing response", { stdout: listShares, stderr: listSharesErr })

      if (listSharesErr && !listShares) {
        return NextResponse.json({
          success: false,
          error: "Failed to list SMB shares",
          details: listSharesErr,
        })
      }
    } catch (error) {
      logDebug("Error listing shares", { error })
      // Continue to next test
    }

    // Test 2: Can we connect to the specific share?
    logDebug("Test 2: Connecting to specific share")
    try {
      const { stdout: connectOut, stderr: connectErr } = await execAsync(
        `smbclient "${smbSharePath}" ${smbAuth} -c "ls"`,
      )

      logDebug("SMB connection test response", { stdout: connectOut, stderr: connectErr })

      if (connectErr && !connectOut) {
        return NextResponse.json({
          success: false,
          error: "Failed to connect to SMB share",
          details: connectErr,
        })
      }

      if (connectOut) {
        logDebug("Successfully connected to SMB share")
      }
    } catch (error) {
      logDebug("Error connecting to share", { error })
      return NextResponse.json({
        success: false,
        error: "Error connecting to SMB share",
        details: (error as Error).message,
      })
    }

    // Test 3: Can we read the specific file?
    logDebug("Test 3: Reading specific file")
    try {
      const { stdout: readOut, stderr: readErr } = await execAsync(
        `smbclient "${smbSharePath}" ${smbAuth} -c "get ${SMB_FILE_PATH} -" | head -n 10`,
      )

      logDebug("SMB file read test", {
        hasContent: readOut && readOut.length > 0,
        stdout: readOut.substring(0, 100),
        stderr: readErr,
      })

      if (readErr && !readOut) {
        return NextResponse.json({
          success: false,
          error: "Failed to read file from SMB share",
          details: readErr,
        })
      }

      if (!readOut || readOut.length < 10) {
        return NextResponse.json({
          success: false,
          error: "File read returned too little data",
          details: "The file may not exist or be empty",
        })
      }
    } catch (error) {
      logDebug("Error reading file", { error })
      return NextResponse.json({
        success: false,
        error: "Error reading file from SMB share",
        details: (error as Error).message,
      })
    }

    // All tests passed
    return NextResponse.json({
      success: true,
      message: "SMB connection tests passed successfully",
    })
  } catch (error) {
    logDebug("Unexpected error in SMB check", { error })

    return NextResponse.json(
      {
        success: false,
        error: "SMB connection check failed",
        details: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 },
    )
  }
}
