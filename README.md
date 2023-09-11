# assignment-community
# Project Name

Short description or tagline for your project.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Models](#models)
- [Setup](#setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

Provide a brief overview of your project. Explain its purpose and main features. Mention any unique selling points or use cases.

## Tech Stack

List the technologies, libraries, and frameworks used in your project. Include version numbers if relevant.

- Node.js (v14+)
- Database: Postgres / MySQL / MongoDB (Specify which one you used)
- ORM: Sequelize / Prisma / Mongoose / MongoDB Native Driver (Specify which one you used)
- @theinternetfolks/snowflake (for generating unique IDs)
- Other libraries or dependencies

## API Endpoints

Provide a list of the API endpoints your project supports. Include a short description of each endpoint.

### Role

- **Create Role**: `POST /v1/role`
- **Get All Roles**: `GET /v1/role`

### User

- **Sign Up**: `POST /v1/auth/signup`
- **Sign In**: `POST /v1/auth/signin`
- **Get Me**: `GET /v1/auth/me`

### Community

- **Create Community**: `POST /v1/community`
- **Get All Communities**: `GET /v1/community`
- **Get All Members**: `GET /v1/community/:id/members`
- **Get My Owned Community**: `GET /v1/community/me/owner`
- **Get My Joined Community**: `GET /v1/community/me/member`

### Member

- **Add Member**: `POST /v1/member`
- **Remove Member**: `DELETE /v1/member/:id`

## Models

Explain your database models and their fields. Include any important relationships between models.

### User (user)

- **id**: string (snowflake), primary key
- **name**: varchar(64), default: null
- **email**: varchar(128), unique
- **password**: varchar(64)
- **created_at**: datetime

### Community (community)

- **id**: string (snowflake), primary key
- **name**: varchar(128)
- **slug**: varchar(255), unique
- **owner**: string (snowflake), ref: > user.id, relationship: m2o
- **created_at**: datetime
- **updated_at**: datetime

### Role (role)

- **id**: string (snowflake), primary key
- **name**: varchar(64), unique
- **created_at**: datetime
- **updated_at**: datetime

### Member (member)

- **id**: string (snowflake), primary key
- **community**: string (snowflake), ref: > community.id
- **user**: string (snowflake), ref: > user.id
- **role**: string (snowflake), ref: > role.id
- **created_at**: datetime

## Setup

Explain how to set up and configure your project locally. Include any environment variables or configuration files that need to be set up.

## Usage

Provide examples and instructions on how to use your project. Include code snippets if necessary.

## Contributing

Explain how others can contribute to your project. Include guidelines for pull requests and contributions.

## License

Specify the license under which your project is distributed. For example, you can use the MIT License, Apache License, or any other open-source license.

