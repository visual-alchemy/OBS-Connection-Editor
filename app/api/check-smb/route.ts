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
    logDebug("SMB connection test requested");
    
    // Test 1: Can we list shares?
    logDebug("Test 1: Listing shares");
    try {
      const { stdout: listShares, stderr: listSharesErr } = await execAsync(`smbclient -L //192.168.40.145 -N`);
      
      logDebug("SMB share listing response", { stdout: listShares, stderr: listSharesErr });
      
      if (listSharesErr && !listShares) {
        return NextResponse.json({ 
          success: false, 
          error: "Failed to list SMB shares", 
          details: listSharesErr 
        });
      }
    } catch (error) {
      logDebug("Error listing shares", { error });
      // Continue to next test
    }
    
    // Test 2: Can we connect to the specific share?
    logDebug("Test 2: Connecting to specific share");
    try {
      const { stdout: connectOut, stderr: connectErr } = await execAsync(`smbclient "//192.168.40.145/OBS Multi" -U guest% -c "ls"`);
      
      logDebug("SMB connection test response", { stdout: connectOut, stderr: connectErr });
      
      if (connectErr && !connectOut) {
        return NextResponse.json({ 
          success: false, 
          error: "Failed to connect to SMB share", 
          details: connectErr 
        });
      }
      
      if (connectOut) {
        logDebug("Successfully connected to SMB share");
      }
    } catch (error) {
      logDebug("Error connecting to share", { error });
      return NextResponse.json({ 
        success: false, 
        error: "Error connecting to SMB share", 
        details: (error as Error).message 
      });
    }
    
    // Test 3: Can we read the specific file?
    logDebug("Test 3: Reading specific file");
    try {
      const { stdout: readOut, stderr: readErr } = await execAsync(`smbclient "//192.168.40.145/OBS Multi" -U guest% -c "get src/App.svelte -" | head -n 10`);
      
      logDebug("SMB file read test", { 
        hasContent: readOut && readOut.length > 0,
        stdout: readOut.substring(0, 100),
        stderr: readErr
      });
      
      if (readErr && !readOut) {
        return NextResponse.json({ 
          success: false, 
          error: "Failed to read file from SMB share", 
          details: readErr
        });
      }
      
      if (!readOut || readOut.length < 10) {
        return NextResponse.json({ 
          success: false, 
          error: "File read returned too little data", 
          details: "The file may not exist or be empty"
        });
      }
    } catch (error) {
      logDebug("Error reading file", { error });
      return NextResponse.json({ 
        success: false, 
        error: "Error reading file from SMB share", 
        details: (error as Error).message 
      });
    }
    
    // All tests passed
    return NextResponse.json({ 
      success: true, 
      message: "SMB connection tests passed successfully"
    });
  } catch (error) {
    logDebug("Unexpected error in SMB check", { error });
    
    return NextResponse.json({ 
      success: false, 
      error: "SMB connection check failed", 
      details: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
} 