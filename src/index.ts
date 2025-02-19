#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const API_BASE_URL = "https://api.pulsemcp.com/v0beta";

interface ListServersArgs {
	query?: string;
	count_per_page?: number;
	offset?: number;
}

interface ListServersResponse {
	servers: Array<{
		name: string;
		url: string;
		external_url?: string;
		short_description?: string;
		source_code_url?: string;
		github_stars?: number;
		package_registry?: string;
		package_name?: string;
		package_download_count?: number;
		EXPERIMENTAL_ai_generated_description?: string;
	}>;
	next?: string;
	total_count: number;
}

const isListServersArgs = (args: any): args is ListServersArgs => {
	if (typeof args !== "object" || args === null) return false;

	if ("query" in args && typeof args.query !== "string") return false;
	if ("count_per_page" in args && typeof args.count_per_page !== "number")
		return false;
	if ("offset" in args && typeof args.offset !== "number") return false;

	return true;
};

class PulseMcpServer {
	private server: Server;
	private axiosInstance;

	constructor() {
		this.server = new Server(
			{
				name: "pulse-mcp",
				version: "0.1.0",
			},
			{
				capabilities: {
					tools: {},
				},
			}
		);

		this.axiosInstance = axios.create({
			baseURL: API_BASE_URL,
		});

		this.setupToolHandlers();

		// Error handling
		this.server.onerror = (error) => console.error("[MCP Error]", error);
		process.on("SIGINT", async () => {
			await this.server.close();
			process.exit(0);
		});
	}

	private setupToolHandlers() {
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: [
				{
					name: "list_servers",
					description: "List MCP servers with optional filtering",
					inputSchema: {
						type: "object",
						properties: {
							query: {
								type: "string",
								description: "Search term to filter servers",
							},
							count_per_page: {
								type: "number",
								description: "Number of results per page (maximum: 5000)",
								maximum: 5000,
							},
							offset: {
								type: "number",
								description: "Number of results to skip for pagination",
							},
						},
					},
				},
			],
		}));

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			switch (request.params.name) {
				case "list_servers": {
					if (!isListServersArgs(request.params.arguments)) {
						throw new McpError(
							ErrorCode.InvalidParams,
							"Invalid arguments for list_servers"
						);
					}

					try {
						const response = await this.axiosInstance.get<ListServersResponse>(
							"/servers",
							{
								params: {
									query: request.params.arguments.query,
									count_per_page: request.params.arguments.count_per_page,
									offset: request.params.arguments.offset,
								},
							}
						);

						return {
							content: [
								{
									type: "text",
									text: JSON.stringify(response.data, null, 2),
								},
							],
						};
					} catch (error) {
						if (axios.isAxiosError(error)) {
							return {
								content: [
									{
										type: "text",
										text: `API Error: ${
											error.response?.data?.error?.message ?? error.message
										}`,
									},
								],
								isError: true,
							};
						}
						throw error;
					}
				}

				default:
					throw new McpError(
						ErrorCode.MethodNotFound,
						`Unknown tool: ${request.params.name}`
					);
			}
		});
	}

	async run() {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error("Pulse MCP server running on stdio");
	}
}

const server = new PulseMcpServer();
server.run().catch(console.error);
