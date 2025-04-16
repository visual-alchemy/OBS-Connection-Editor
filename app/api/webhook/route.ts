import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Store active SSE connections
type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
}

let clients: Client[] = []

export async function GET(request: NextRequest) {
  // Create a response stream for Server-Sent Events
  const clientId = crypto.randomUUID()
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`id: ${clientId}\n`))
      controller.enqueue(encoder.encode(`event: connected\n`))
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ connected: true })}\n\n`))
      
      // Add this client to active connections
      clients.push({ 
        id: clientId,
        controller
      })
      
      // Remove client when connection closes
      request.signal.addEventListener("abort", () => {
        clients = clients.filter(client => client.id !== clientId)
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Get file content from SMB server
    const { stdout } = await execAsync(
      `smbclient "//192.168.40.154/OBS Multi" -U guest% -c "get src/App.svelte -"`
    )
    
    // Broadcast update to all connected clients
    const data = {
      timestamp: new Date().toISOString(),
      content: stdout,
    }
    
    broadcastUpdate(data)
    
    return NextResponse.json({ success: true, clientCount: clients.length })
  } catch (error) {
    console.error("Error in webhook:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// Utility function to broadcast updates to all connected clients
function broadcastUpdate(data: any) {
  const encoder = new TextEncoder()
  
  clients.forEach(client => {
    try {
      const { controller } = client
      controller.enqueue(encoder.encode(`event: update\n`))
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
    } catch (err) {
      console.error(`Error sending to client ${client.id}:`, err)
    }
  })
} 