# Dandelions V2 Backend

This repository contains the code for the Lambda functions used by both the WebSocket and REST APIs of the Dandelions V2 game.

## Overview

### WebSocket API

The WebSocket API allows players to:
- Enter a game room by providing a `roomId`.
- Send and receive messages within the game room in real-time.

### REST API

The REST API provides an endpoint to:
- Check whether a specified game ID exists in the database.

## Lambda Functions

- **WebSocket Lambda Function**: Handles real-time communication, including entering game rooms and exchanging messages between players.
- **REST Lambda Function**: Provides an endpoint for verifying the existence of a game ID.

## Frontend

The frontend for the Dandelions V2 game is available [here](https://github.com/sophiabarness/DandelionsV2Frontend). The frontend interacts with the APIs described above.