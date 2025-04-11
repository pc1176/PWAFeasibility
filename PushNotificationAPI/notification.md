# Push Notification Implementation

## Overview

This project implements push notifications in a Progressive Web Application (PWA) using **Angular 18** for the frontend and **.NET Core** for the backend. The system leverages the **Web Push protocol** to deliver notifications even when the application is not actively open.

---

## Features

- Push notification subscription and management  
- Real-time notification delivery  
- Notification click handling to open/focus the application  
- Location-based notification triggers  
- Secure communication using **VAPID** authentication  
- Persistent storage of push subscriptions  

---

## Architecture

The push notification system consists of three main components:

1. **Angular Service Worker**  
   Handles receiving push events and displaying notifications.

2. **Angular Notification Service**  
   Manages subscription to push notifications and communication with the backend.

3. **.NET Core Backend**  
   Stores subscriptions and sends push notifications using the Web Push protocol.

---

## How It Works

### Client-Side Subscription Process

- The Angular app registers a **custom service worker** that extends the default Angular service worker.  
- The app requests **notification permission** from the user.  
- The `NotificationService` uses Angular’s `SwPush` to request a push subscription.  
- The subscription object is sent to the backend API and stored in a **PostgreSQL** database.

### Server-Side Notification Sending

- The backend receives a request to send a notification.  
- The server creates a **payload** with title, body, icon, etc.  
- The **Web Push protocol** is used to send the notification using the stored subscription data.

### Client-Side Notification Handling

- The service worker listens for **push events** and parses the notification.  
- Notification is displayed using the `showNotification` API.  
- On click, the service worker **focuses or opens** the application window.

---

## Key Components

### Angular Service Worker

- Custom service worker that extends Angular's default.  
- Push event listener for handling incoming notifications.  
- Notification click handler for managing user interaction.  
- Client management logic for window focus/open.

### Angular Notification Service

- Manages push notification subscriptions.  
- Verifies service worker and subscription status.  
- Sends subscription info to the backend.  
- Includes a **test notification** feature.

### .NET Core Backend

- Uses the **WebPush** library to send notifications.  
- Implements **VAPID** for secure communication.  
- Stores push subscriptions in **PostgreSQL** using **Entity Framework Core**.  
- Provides API endpoints for managing subscriptions and sending notifications.

---

## Database Storage

- Entity Framework Core + PostgreSQL  
- Subscription model with:
  - Endpoint URLs  
  - Encryption keys (stored as `JSONB`)  

---

## Security Considerations

- **HTTPS** is required for push notifications.  
- **VAPID authentication** ensures secure server identity.  
- **CORS** configured to restrict API access.  
- Failed subscriptions are periodically removed to keep the database clean.

---

## Testing and Debugging

- Extensive logging on both client and server.  
- Built-in test notification capability.  
- Retry logic for failed API calls.  
- Update and remove subscriptions as needed.

---

## Getting Started

### Prerequisites

- Angular 18  
- .NET Core 6.0 or later  
- PostgreSQL  
- VAPID keys

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Install Angular dependencies
cd <angular-project-directory>
npm install

# Restore .NET Core dependencies
cd <dotnet-backend-directory>
dotnet restore
