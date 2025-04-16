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

export async function GET(request: NextRequest) {
  try {
    logDebug("Read file request received");
    
    // Read file using smbclient with debug level
    logDebug("Attempting to read file from SMB share");
    const smbCommand = `smbclient "//192.168.40.145/OBS Multi" -U guest% -d 3 -c "get src/App.svelte -"`;
    logDebug(`SMB command: ${smbCommand}`);
    
    let content = "";
    
    try {
      // Execute the command with debug level 3
      const { stdout, stderr } = await execAsync(smbCommand);
      content = stdout;
      
      logDebug(`SMB read command executed, received ${content.length} characters`);
      logDebug(`First 100 chars: ${content.substring(0, 100)}...`);
      
      if (stderr) {
        logDebug("SMB command had stderr output", { stderr });
      }
      
      // Validate that we got reasonable content
      if (!content || content.length < 10) {
        logDebug("Warning: Content appears too short, may not be valid");
      }
      
      if (!content.includes("<script>") && !content.includes("connections =")) {
        logDebug("Warning: Content may not be a valid Svelte file - missing expected content");
      }
    } catch (smbError) {
      logDebug(`SMB error encountered: ${(smbError as Error).message}`);
      
      // Try an alternative approach without debug flags
      try {
        logDebug("Trying alternative SMB command");
        const { stdout } = await execAsync(`smbclient "//192.168.40.145/OBS Multi" -U guest% -c "get src/App.svelte -"`);
        content = stdout;
        logDebug(`Alternative approach succeeded, got ${content.length} characters`);
      } catch (altError) {
        logDebug(`Alternative SMB approach also failed: ${(altError as Error).message}`);
        throw altError; // Re-throw for outer catch
      }
    }

    logDebug("Read file operation completed successfully");
    return NextResponse.json({ content })
  } catch (error) {
    const errorMsg = (error as Error).message;
    logDebug(`Error reading file: ${errorMsg}`, error);
    console.error("Error reading file:", error);
    
    return NextResponse.json({ 
      error: errorMsg,
      stack: (error as Error).stack,
      details: "See server logs for more information"
    }, { status: 500 })
  }
}

