import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import * as crypto from "crypto"

const execAsync = promisify(exec)

// Store the last file content hash for comparison
let lastContentHash = ""

export async function GET(request: NextRequest) {
  try {
    // Get current file content from SMB
    const { stdout } = await execAsync(
      `smbclient "//192.168.40.154/OBS Multi" -U guest% -c "get src/App.svelte -"`
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