/**
 * Swagger/OpenAPI Configuration
 * 
 * Configures API documentation using Swagger UI Express and JSDoc comments.
 * 
 * @module config/swagger
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Swagger Configuration Options
 * 
 * @type {Object}
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Jersey Store API Documentation',
            version: '1.0.0',
            description: `
                🏈 Complete REST API documentation for Jersey Store E-Commerce Platform.
                
                ## Features
                - 🔐 Authentication & Authorization (JWT)
                - 👤 User Management
                - 👕 Product Management (Jerseys)
                - 🛒 Shopping Cart
                - 📦 Order Processing
                - ⭐ Product Reviews
                - 📊 Admin Dashboard
                
                ## Authentication
                This API uses JWT (JSON Web Token) for authentication.
                Include the token in the Authorization header:
                \`Bearer <your-token>\`
                
                ## Rate Limiting
                - 100 requests per 15 minutes per IP
            `,
            contact: {
                name: 'API Support',
                email: 'support@jerseystore.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token here'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        first_name: { type: 'string', example: 'John' },
                        last_name: { type: 'string', example: 'Doe' },
                        phone: { type: 'string', example: '+1234567890' },
                        address: { type: 'string', example: '123 Main St' },
                        city: { type: 'string', example: 'New York' },
                        state: { type: 'string', example: 'NY' },
                        zip_code: { type: 'string', example: '10001' },
                        country: { type: 'string', example: 'USA' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                        is_active: { type: 'boolean', example: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Manchester United Home Jersey 2024' },
                        description: { type: 'string', example: 'Official Manchester United home jersey' },
                        price: { type: 'number', format: 'float', example: 89.99 },
                        discount_price: { type: 'number', format: 'float', example: 79.99 },
                        category: { type: 'string', example: 'Club' },
                        brand: { type: 'string', example: 'Adidas' },
                        size: { type: 'string', example: 'M' },
                        color: { type: 'string', example: 'Red' },
                        material: { type: 'string', example: 'Polyester' },
                        stock_quantity: { type: 'integer', example: 50 },
                        images: { type: 'array', items: { type: 'string' } },
                        is_active: { type: 'boolean', example: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        product_id: { type: 'integer' },
                        quantity: { type: 'integer', example: 2 },
                        size: { type: 'string', example: 'M' },
                        color: { type: 'string', example: 'Red' },
                        added_at: { type: 'string', format: 'date-time' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        order_number: { type: 'string', example: 'ORD-1647251234-123' },
                        total_amount: { type: 'number', example: 179.98 },
                        shipping_address: { type: 'string' },
                        shipping_city: { type: 'string' },
                        shipping_state: { type: 'string' },
                        shipping_zip: { type: 'string' },
                        shipping_country: { type: 'string' },
                        payment_method: { type: 'string', example: 'credit_card' },
                        payment_status: { type: 'string', enum: ['pending', 'paid', 'failed'] },
                        order_status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
                        tracking_number: { type: 'string' },
                        notes: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
                                code: { type: 'string' },
                                details: { type: 'object' }
                            }
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication failed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Authentication', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management' },
            { name: 'Products', description: 'Product management' },
            { name: 'Cart', description: 'Shopping cart' },
            { name: 'Orders', description: 'Order management' },
            { name: 'Reviews', description: 'Product reviews' }
        ]
    },
    apis: [
        './src/routes/*.js',
        './src/controllers/*.js'
    ]
};

/**
 * Setup Swagger documentation
 * 
 * @function setupSwagger
 * @param {Object} app - Express application instance
 * @returns {Object} Swagger specification
 */
const setupSwagger = (app) => {
    try {
        const swaggerSpec = swaggerJsdoc(swaggerOptions);
        
        // Serve Swagger UI
        app.use(
            '/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(swaggerSpec, {
                explorer: true,
                customSiteTitle: 'Jersey Store API Documentation',
                swaggerOptions: {
                    docExpansion: 'list',
                    defaultModelsExpandDepth: 3,
                    defaultModelExpandDepth: 3,
                    persistAuthorization: true,
                    displayOperationId: true,
                    filter: true,
                    showExtensions: true,
                    showCommonExtensions: true,
                    tryItOutEnabled: true
                }
            })
        );
        
        // Serve Swagger JSON
        app.get('/api-docs.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
        
        console.log('📚 Swagger documentation available at /api-docs');
        return swaggerSpec;
    } catch (error) {
        console.error('❌ Error setting up Swagger:', error);
        return null;
    }
};

module.exports = setupSwagger;