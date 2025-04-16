"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check } from "lucide-react"
import Image from "next/image"

interface Connection {
  id?: string
  category: string
  address: string
  show: boolean
  name: string
}

export default function Home() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([])
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [connectionCount, setConnectionCount] = useState(0)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)

  useEffect(() => {
    // Load the Samba file on component mount
    loadSambaFile()
  }, [])

  useEffect(() => {
    // Filter connections based on category and search term
    let filtered = [...connections]

    if (filter !== "all") {
      filtered = filtered.filter((conn) => conn.category === filter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (conn) =>
          conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conn.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredConnections(filtered)
  }, [connections, filter, searchTerm])

  const parseConnectionsFromContent = (text: string) => {
    // Extract the connections array from the Svelte file
    const connectionsMatch = text.match(/let connections = \[([\s\S]*?)\];/)

    if (connectionsMatch && connectionsMatch[1]) {
      const connectionsText = connectionsMatch[1]

      // Parse the connections array
      const connectionItems: Connection[] = []
      const regex = /{category:\s*['"]([^'"]*)['"]\s*,\s*address:\s*['"]([^'"]*)['"]\s*,\s*show:\s*([^,]*)\s*,\s*name:\s*['"]([^'"]*)['"]\s*([^}]*)}/g

      let match
      let id = 1
      while ((match = regex.exec(connectionsText)) !== null) {
        connectionItems.push({
          id: `conn_${id}`,
          category: match[1],
          address: match[2],
          show: match[3] === "true",
          name: match[4],
        })
        id++
      }

      setConnections(connectionItems)
      setConnectionCount(connectionItems.length)
      setMessage({ type: "success", text: `Updated with ${connectionItems.length} connections` })
    } else {
      setMessage({ type: "error", text: "Could not find connections array in the file" })
    }
  }

  const loadSambaFile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/read-file')
      const data = await response.json()
      
      if (data.error) {
        setMessage({ type: "error", text: data.error })
        return
      }

      const text = data.content
      parseConnectionsFromContent(text)
    } catch (error) {
      setMessage({ type: "error", text: "Error reading file: " + (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const saveChanges = async () => {
    setIsLoading(true)
    setMessage({ type: "info", text: "Saving changes..." })
    try {
      // Get the latest file content
      console.log("Fetching latest file content...");
      const response = await fetch('/api/read-file')
      const data = await response.json()
      
      if (data.error) {
        console.error("Error reading file:", data.error);
        throw new Error(data.error)
      }
      
      const content = data.content
      console.log(`Received content (${content.length} chars)`);
      
      // Find the connections array in the content
      const contentLines = content.split('\n')
      const connectionsStartIndex = contentLines.findIndex((line: string) => line.includes('let connections = ['))
      const connectionsEndIndex = contentLines.findIndex((line: string, idx: number) => idx > connectionsStartIndex && line.includes('];'))
      
      console.log(`Found connections array at lines ${connectionsStartIndex} to ${connectionsEndIndex}`);
      
      if (connectionsStartIndex === -1 || connectionsEndIndex === -1) {
        console.error("Could not find connections array in file content");
        throw new Error("Could not find connections array in the file")
      }
      
      // Extract the connections section from the file
      const connectionSection = contentLines.slice(connectionsStartIndex + 1, connectionsEndIndex)
      console.log(`Extracted ${connectionSection.length} connection lines`);
      
      // Map to track which lines have been modified
      const modifiedLines = new Map()
      
      // For each connection in our React state
      connections.forEach(conn => {
        // Try to find the corresponding connection line in the Svelte file
        let lineIndex = -1;
        let matchType = "none";
        
        // Look for matching name or address to identify the connection
        for (let i = 0; i < connectionSection.length; i++) {
          const line = connectionSection[i];
          
          if (line.includes(`name: '${conn.name}'`)) {
            lineIndex = i;
            matchType = "name";
            break;
          }
          
          if (line.includes(`address: '${conn.address}'`)) {
            lineIndex = i;
            matchType = "address";
            break;
          }
        }
        
        console.log(`Connection ${conn.name} (${conn.id}): found match=${matchType}, line=${lineIndex}`);
        
        if (lineIndex >= 0) {
          let line = connectionSection[lineIndex];
          let originalLine = line;
          
          // Update only the specific properties without changing the order
          // This preserves the structure of each line
          
          // Update category if needed
          if (line.includes('category:')) {
            line = line.replace(/category:\s*['"]([^'"]*)['"]/g, `category: '${conn.category}'`);
          }
          
          // Update address if needed
          if (line.includes('address:')) {
            line = line.replace(/address:\s*['"]([^'"]*)['"]/g, `address: '${conn.address}'`);
          }
          
          // Update show if needed
          if (line.includes('show:')) {
            line = line.replace(/show:\s*(true|false)/g, `show: ${conn.show}`);
          }
          
          // Update name if needed
          if (line.includes('name:')) {
            line = line.replace(/name:\s*['"]([^'"]*)['"]/g, `name: '${conn.name}'`);
          }
          
          // Check if the line was actually modified
          const wasModified = line !== originalLine;
          console.log(`Line ${lineIndex} modified: ${wasModified}`);
          
          // Mark this line as modified
          if (wasModified) {
            modifiedLines.set(lineIndex, line);
          }
        }
      });
      
      console.log(`Modified ${modifiedLines.size} lines`);
      
      // If no changes were made, alert the user
      if (modifiedLines.size === 0) {
        console.log("No changes detected to save");
        setMessage({ type: "info", text: "No changes detected to save" })
        setIsLoading(false)
        return;
      }
      
      // Apply the modifications while preserving the original structure
      for (let [index, line] of modifiedLines.entries()) {
        connectionSection[index] = line;
      }
      
      // Put the modified connection section back into the content
      contentLines.splice(
        connectionsStartIndex + 1,
        connectionsEndIndex - connectionsStartIndex - 1,
        ...connectionSection
      );
      
      const updatedContent = contentLines.join('\n')
      console.log(`Updated content (${updatedContent.length} chars)`);
      
      // Verify changes
      const originalConnLines = content.split('\n').slice(connectionsStartIndex, connectionsEndIndex + 1).join('\n');
      const updatedConnLines = updatedContent.split('\n').slice(connectionsStartIndex, connectionsEndIndex + 1).join('\n');
      
      console.log("Diff of connection section:", originalConnLines !== updatedConnLines);
      
      console.log("Sending updated content to server...");
      
      // Save to SMB share
      const saveResponse = await fetch('/api/save-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: updatedContent
        }),
      })
      
      const saveData = await saveResponse.json()
      console.log("Save response:", saveData);
      
      if (saveData.error) {
        console.error("Error from save API:", saveData.error);
        throw new Error(saveData.error)
      }
      
      setMessage({ type: "success", text: "Changes saved successfully" })
    } catch (error) {
      console.error("Error in saveChanges:", error);
      setMessage({ type: "error", text: "Error saving changes: " + (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const updateConnection = (updatedConnection: Connection) => {
    setConnections(
      connections.map((conn) => (conn.id === updatedConnection.id ? updatedConnection : conn))
    )
    setSelectedConnection(null)
  }

  const toggleConnectionVisibility = (id: string | undefined) => {
    if (!id) return
    
    setConnections(
      connections.map((conn) => {
        if (conn.id === id) {
          return { ...conn, show: !conn.show }
        }
        return conn
      })
    )
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto max-w-[1400px] px-4 py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="mr-2">
              <Image 
                src="/Logo-Vidio-Apps.png" 
                alt="Vidio Apps Logo" 
                width={32} 
                height={32} 
              />
            </div>
            <h1 className="text-2xl font-bold">OBS Connection Editor</h1>
          </div>
          <div className="flex items-center">
            <div className="rounded-full bg-gray-900 px-4 py-1 flex items-center mr-4">
              <span className="mr-2">Connected</span>
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            </div>
            {message.type === "success" && (
              <div className="bg-green-950/30 text-green-400 border border-green-600/20 rounded-md px-4 py-2 flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-500" />
                <div>
                  <div className="font-medium">Success</div>
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            )}
            {message.type === "error" && (
              <div className="bg-red-950/30 text-red-400 border border-red-600/20 rounded-md px-4 py-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <div className="font-medium">Error</div>
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            )}
            {message.type === "info" && (
              <div className="bg-blue-950/30 text-blue-400 border border-blue-600/20 rounded-md px-4 py-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div>
                  <div className="font-medium">Info</div>
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content - Connections list */}
          <div className="md:col-span-8">
            <Card className="bg-black border border-gray-800 overflow-hidden rounded-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-1">Connections ({connectionCount})</h2>
                <p className="text-gray-400 text-sm mb-5">Manage your OBS connections</p>
                
                <div className="flex items-center justify-between mb-5">
                  <div className="w-full mr-4">
                    <label className="block text-sm mb-2">Search</label>
                    <Input 
                      placeholder="Search by name or address" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-black border border-gray-800 text-white h-10"
                    />
                  </div>
                  <div className="w-64">
                    <label className="block text-sm mb-2">Filter by Category</label>
                    <select 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                      className="bg-black border border-gray-800 rounded-md p-2 text-white w-full h-10"
                    >
                      <option value="all">All Categories</option>
                      <option value="primary">Primary</option>
                      <option value="backup">Backup</option>
                    </select>
                  </div>
                </div>
                
                <div className="border border-gray-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 bg-gray-900/50">
                        <TableHead className="text-gray-300 font-medium">Name</TableHead>
                        <TableHead className="text-gray-300 font-medium">Category</TableHead>
                        <TableHead className="text-gray-300 font-medium">Address</TableHead>
                        <TableHead className="text-gray-300 font-medium">Show</TableHead>
                        <TableHead className="text-gray-300 font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConnections.length > 0 ? (
                        filteredConnections.map((conn) => (
                          <TableRow key={conn.id} className="border-gray-800 hover:bg-gray-900/30">
                            <TableCell className="font-medium">{conn.name}</TableCell>
                            <TableCell className="text-gray-300">{conn.category}</TableCell>
                            <TableCell className="font-mono text-sm">{conn.address}</TableCell>
                            <TableCell>
                              <button 
                                onClick={() => toggleConnectionVisibility(conn.id)}
                                className="text-gray-300 hover:text-white"
                              >
                                {conn.show ? "true" : "false"}
                              </button>
                            </TableCell>
                            <TableCell>
                              <button 
                                className="text-gray-300 hover:text-white"
                                onClick={() => setSelectedConnection(conn)}
                              >
                                Edit
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-400">
                            No connections match your filter criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Connection Operations */}
          <div className="md:col-span-4">
            <Card className="bg-black border border-gray-800 rounded-xl">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-1">Connection Operations</h2>
                <p className="text-gray-400 text-sm mb-5">Manage your OBS connections</p>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white mb-4 flex items-center justify-center h-10 rounded-md"
                  onClick={saveChanges}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save Changes
                </Button>
              </div>
            </Card>

            {selectedConnection && (
              <Card className="bg-black border border-gray-800 mt-6 rounded-xl">
                <div className="p-6 relative">
                  <h2 className="text-xl font-bold mb-1">Edit Connection</h2>
                  <p className="text-gray-400 text-sm mb-5">Modify the selected connection</p>
                  
                  <button 
                    onClick={() => setSelectedConnection(null)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white"
                    aria-label="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Name</label>
                      <Input 
                        value={selectedConnection.name}
                        onChange={(e) => setSelectedConnection({...selectedConnection, name: e.target.value})}
                        className="bg-black border border-gray-800 text-white h-10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-2">Address</label>
                      <Input 
                        value={selectedConnection.address}
                        onChange={(e) => setSelectedConnection({...selectedConnection, address: e.target.value})}
                        className="bg-black border border-gray-800 text-white h-10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-2">Category</label>
                      <select 
                        value={selectedConnection.category}
                        onChange={(e) => setSelectedConnection({...selectedConnection, category: e.target.value})}
                        className="bg-black border border-gray-800 rounded-md p-2 text-white w-full h-10"
                      >
                        <option value="primary">Primary</option>
                        <option value="backup">Backup</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <label className="block text-sm mr-2">Show:</label>
                      <input 
                        type="checkbox" 
                        checked={selectedConnection.show}
                        onChange={(e) => setSelectedConnection({...selectedConnection, show: e.target.checked})}
                        className="h-4 w-4"
                      />
                    </div>
                    
                    <div className="pt-4 flex justify-between mt-2">
                      <Button
                        onClick={() => {
                          if (selectedConnection && selectedConnection.id) {
                            setConnections(connections.filter(conn => conn.id !== selectedConnection.id))
                            setSelectedConnection(null)
                          }
                        }}
                        className="bg-red-700 hover:bg-red-800 h-10 rounded-md"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </Button>
                      
                      <Button
                        onClick={() => updateConnection(selectedConnection)}
                        className="bg-white hover:bg-gray-100 text-black h-10 rounded-md"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

