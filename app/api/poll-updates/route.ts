import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import * as crypto from "crypto"

const execAsync = promisify(exec)

// Store the last file content hash for comparison
let lastContentHash = ""

const SMB_ADDRESS = process.env.SMB_ADDRESS || "192.168.40.145"
const SMB_SHARE_NAME = process.env.SMB_SHARE_NAME || "OBS Multi"
const SMB_USERNAME = process.env.SMB_USERNAME || "guest"
const SMB_PASSWORD = process.env.SMB_PASSWORD || ""
const SMB_FILE_PATH = process.env.SMB_FILE_PATH || "src/App.svelte"

export async function GET(request: NextRequest) {
  try {
    const smbAuth = SMB_PASSWORD ? `-U ${SMB_USERNAME}%${SMB_PASSWORD}` : `-U ${SMB_USERNAME}%`
    const smbSharePath = `//${SMB_ADDRESS}/${SMB_SHARE_NAME}`
    
    // Get current file content from SMB
    const { stdout } = await execAsync(
      `smbclient "${smbSharePath}" ${smbAuth} -c "get ${SMB_FILE_PATH} -"`
    )
    
    // Generate hash of content for comparison
    const contentHash = crypto.createHash('md5').update(stdout).digest('hex')
    
    // Check if content has changed
    const hasChanged = contentHash !== lastContentHash
    
    // Update the hash if content changed
    if (hasChanged) {
      lastContentHash = contentHash
      
      // Trigger webhook endpoint to broadcast the update
      await fetch(new URL('/api/webhook', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ source: 'poll-updates' })
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      hasChanged,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error polling for updates:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
} 