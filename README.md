# Boilerplate Node-Mongo-TS

Welcome to the Boilerplate Node-Mongo-TS repository! This project serves as a solid foundation for building scalable and robust Node.js applications with MongoDB integration. It comes with essential configurations, middleware, helpers, validators, and a modular folder structure for easy organization and maintenance.

## Features

- **Node.js**: A JavaScript runtime environment for server-side applications.
- **MongoDB**: A NoSQL database for storing JSON-like documents.
- **Express**: A minimalist web framework for Node.js.
- **Joi**: A powerful schema description language and validator for JavaScript objects.
- **Socket.io**: A library for real-time bidirectional event-based communication.

## Project Structure

```plaintext
├── api
│   └── api-base.js
├── config
│   └── dev.json
├── helpers
│   ├── ApiError.js
│   ├── catchAsync.js
│   ├── crypto.js
│   ├── jwt.js
│   ├── logger.js
│   ├── morgan.js
│   ├── string.js
│   ├── updateEntities.js
│   └── utils.js
├── middlewares
│   ├── apiRoutes.js
│   ├── auth.js
│   ├── error.js
│   ├── response.js
│   └── validate.js
├── settings
│   ├── database.js
│   └── routes.js
├── src
│   ├── auth
│   ├── api
│   ├── mappers
│   ├── models
│   ├── resources
│   ├── routes
│   ├── services
│   └── validators
├── media
│   ├── api
│   │   ├── providers
│   │   ├── routes
│   │   └── validators
│   ├── README.md
│   └── app.js
├── socket
│   ├── index.js
│   └── validators
│       └── common.validation.js
├── .gitignore
├── Dockerfile
├── README.md
├── README.copy.md
├── app.js
├── docker-compose.yml
├── index.d.ts
├── index.js
├── package-lock.json
├── package.json
└── typedef.js
```

## Configuration

- The project includes a `dev.json` file in the `config` folder for environment-specific configurations.

## Helpers

- The `helpers` folder contains utility functions such as error handling, authentication, encryption, logging, and string manipulation.

## Middlewares

- Middleware functions for handling API routes, authentication, error handling, response formatting, and input validation are located in the `middlewares` folder.

## Settings

- The `settings` folder houses configuration files related to database connections and route settings.

## Source (src)

- The `src` folder contains the main application logic, including authentication, API endpoints, data mappers, models, resources, routes, services, and validators.

## Media

- The `media` folder includes assets such as API documentation, provider details, route definitions, and validator schemas.

## Socket

- The `socket` folder consists of real-time communication logic using Socket.io, along with validators for common socket events.

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/boilerplate-node-mongo-ts.git
cd boilerplate-node-mongo-ts
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the server:

```bash
npm start
# or
yarn start
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or need further assistance, feel free to contact me:

- **GitHub**: [bcoders24](https://github.com/bcoders24)
- **Email**: jag@bcoder.co.in

---

Thank you for choosing this boilerplate project! Happy coding!
