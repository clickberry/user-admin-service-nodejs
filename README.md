# Dockerized Projects worker service
User administration worker micro-service on Node.js

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Environment Variables](#environment-variables)
* [Events](#events)
* [License](#license)

# Architecture
The application is a worker service listening messages from the Bus. Aggregates data about user.

# Technologies
* Node.js
* MongoDB/Mongoose
* Official nsqjs driver for NSQ messaging service

# Environment Variables
The service should be properly configured with following environment variables.

Key | Value | Description
:-- | :-- | :-- 
NSQLOOKUPD_ADDRESSES | nsqlookupd1:4161,nsqlookupd2:4161 | TCP addresses for nsqlookupd instances to read messages from.
MONGODB_CONNECTION | mongodb://mongo_host:mongo_port/projects | MongoDB connection string.

# Events
The service listens events from the Bus (messaging service).

## Receive events

Topic | Channel | Params | Description
:-- | :-- | :-- | :--
video-creates | user-admin | [Video Dto](#video-dto) | Updates aggregated user data
video-deletes | user-admin | {videoId: *videoId*} | Updates aggregated user data
account-creates | user-admin | { id: *user_id*, role: *user_role*, created: *user_created_date*, membership: { id: *id*, provider: *authentication_provider*, email: *user_email*, name: *user_name* } } | Creates aggregated user data
account-deletes | user-admin | { id: *user_id* } | Deletes aggregated user data

# License
Source code is under GNU GPL v3 [license](LICENSE).
