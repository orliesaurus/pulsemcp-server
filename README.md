# PulseMCP Server

A Model Context Protocol (MCP) server that provides tools for discovering and exploring MCP servers and integrations through the PulseMCP API.

<a href="https://glama.ai/mcp/servers/pprxunng2s"><img width="380" height="200" src="https://glama.ai/mcp/servers/pprxunng2s/badge" alt="PulseServer MCP server" /></a>

## Features

- List available MCP servers with filtering and pagination
- Search for specific MCP servers by name or functionality
- Filter servers by integration types
- List all available integrations
- Full TypeScript support

## Installation

### Installing in MCP Clients

Add this to your MCP client configuration and adapt based on your Client's preferences. For example:

```json
{
  "mcpServers": {
    "pulsemcp": {
      "command": "npx",
      "args": ["-y", "pulsemcp-server"]
    }
  }
}
```

1. Clone the repository:

```bash
git clone <repository-url>
cd pulsemcp-server
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

### Running the Server

The server can be run directly after building:

```bash
./build/index.js
```

Or through npm:

```bash
npm start
```

### Development

To watch for changes during development:

```bash
npm run watch
```

To inspect the server's MCP implementation:

```bash
npm run inspector
```

## Available Tools

### list_servers

Lists MCP servers with optional filtering and pagination.

Parameters:

- `query` (optional): Search term to filter servers
- `integrations` (optional): Array of integration slugs to filter by
- `count_per_page` (optional): Number of results per page (maximum: 5000)
- `offset` (optional): Number of results to skip for pagination

Example:

```json
{
  "query": "toolhouse",
  "integrations": ["github"],
  "count_per_page": 10,
  "offset": 0
}
```

### list_integrations

Lists all available integrations. This tool takes no parameters.

## Response Format

Both tools return JSON responses with the following structure:

### list_servers Response

```json
{
  "servers": [
    {
      "name": "Server Name",
      "url": "https://example.com",
      "external_url": "https://external-link.com",
      "short_description": "Server description",
      "source_code_url": "https://github.com/example/repo",
      "github_stars": 123,
      "package_registry": "npm",
      "package_name": "package-name",
      "package_download_count": 1000,
      "integrations": [
        {
          "name": "Integration Name",
          "slug": "integration-slug",
          "url": "https://integration-url.com"
        }
      ]
    }
  ],
  "total_count": 1,
  "next": null
}
```

### list_integrations Response

```json
{
  "integrations": [
    {
      "name": "Integration Name",
      "slug": "integration-slug",
      "url": "https://integration-url.com"
    }
  ]
}
```

## Error Handling

The server includes robust error handling for:

- Invalid parameters
- API connection issues
- Rate limiting
- Authentication errors

Errors are returned in a standardized format with appropriate error codes and messages.

## Development

### Project Structure

```
pulsemcp-server/
├── src/
│   └── index.ts    # Main server implementation
├── build/          # Compiled JavaScript
├── package.json    # Project configuration
└── tsconfig.json   # TypeScript configuration
```

### Dependencies

- @modelcontextprotocol/sdk: ^0.6.0
- axios: ^1.7.9
- TypeScript: ^5.3.3

## License

Read LICENSE.MD

## Contributing

Open a PR - be nice and you will be rewarded!
