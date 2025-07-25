<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# WhatsApp Message Sender - ZAPIN API Project Instructions

This is a Node.js/Express application for sending WhatsApp messages using the ZAPIN API.

## Project Context

- **Framework**: Express.js with session management
- **Frontend**: Vanilla HTML/CSS/JavaScript with Bootstrap 5
- **API Integration**: ZAPIN WhatsApp API
- **File Handling**: Multer for CSV/TXT contact uploads
- **Session Storage**: Express-session for user data isolation

## Key Features

1. **Session-based data isolation** - Each user's data (contacts, templates, history) is stored in their session
2. **Contact management** - Upload CSV/TXT files or add contacts manually
3. **Message templating** - Support for `{nama}` and `{to}` variables
4. **ZAPIN API integration** - Send WhatsApp messages via ZAPIN service
5. **Reporting** - Download CSV reports and view send history

## Code Style Guidelines

- Use async/await for asynchronous operations
- Include proper error handling with try-catch blocks
- Validate user inputs before processing
- Use session initialization helper functions
- Follow RESTful API patterns for endpoints
- Include loading states and user feedback in frontend

## API Integration Notes

- ZAPIN API endpoint: `https://zapin.my.id/send-message`
- Required parameters: `api_key`, `sender`, `number`, `message`
- Success response format: `{ "status": true, "msg": "Message sent successfully!" }`
- Handle rate limiting with delays between requests
- Store API credentials temporarily in session only

## Frontend Patterns

- Use Bootstrap 5 classes for consistent styling
- Implement loading states for long operations
- Show success/error alerts with auto-dismiss
- Update UI immediately after successful API calls
- Use Font Awesome icons for better UX

## Session Management

- Initialize session data with `initSession()` helper
- Store: contacts array, messageTemplate string, sendHistory array
- Clean up temporary uploaded files after processing
- Session expires after 24 hours or server restart
