const swaggerJsDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "College Event Management System API",
            version: "1.0.0",
            description: "A professional REST API for managing college events. This API supports event creation, user applications, admin review workflows, and real-time engagement analytics.",
            contact: {
                name: "ISH-AN",
                url: "https://github.com/ishaaanfarooq",
            },
        },
        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string", enum: ["admin", "student"] },
                        canCreateEvent: { type: "boolean" },
                    },
                },
                Event: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        date: { type: "string", format: "date-time" },
                        location: { type: "string" },
                        category: { type: "string" },
                        maxCapacity: { type: "number" },
                        status: { type: "string", enum: ["pending_review", "published", "rejected"] },
                        viewCount: { type: "number" },
                        totalViewTime: { type: "number" },
                    },
                },
            },
        },
    },
    apis: ["./routes/*.js"], // Path to the API docs
};

const specs = swaggerJsDoc(options);
module.exports = specs;
