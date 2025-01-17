# Project Overview
We are building a Slack-like chat application to support real-time messaging and collaboration for teams. The MVP focuses on user management, channel-based messaging, and file sharing to ensure a productive communication experience.

## User Roles & Core Workflows
1. **Admin**: Creates and manages user accounts to control access.  
2. **Admin**: Assigns roles and permissions for channel oversight.  
3. **Admin**: Archives channels and moderates messages to maintain order.  
4. **Regular User**: Joins and leaves channels to participate in relevant conversations.  
5. **Regular User**: Sends direct and channel messages for real-time communication.  

## Technical Foundation

### Data Models
1. **User**: Stores ID, email, hashedPassword, displayName, role, timestamps.  
2. **Channel**: Stores ID, name, description, isArchived, createdBy, timestamps.  
3. **Membership**: Stores ID, userId, channelId, roleInChannel.  
4. **Message**: Stores ID, channelId, userId, content, fileUrls, timestamps, deletedAt.  
5. **File**: Stores ID, messageId, fileUrl, fileType, uploadedBy, uploadedAt.  
6. **AuditLog**: Stores ID, adminId, actionType, targetId, timestamp, description.

### API Endpoints
1. `POST /api/users` creates a user (admin).  
2. `PUT /api/users/:id` updates user details or deactivates account (admin).  
3. `POST /api/channels` creates a channel (admin or authorized user).  
4. `PUT /api/channels/:id` updates or archives channel (admin or channel owner).  
5. `POST /api/messages` creates a message (channel member).  
6. `PUT /api/messages/:id` edits or deletes a message (owner or admin).  
7. `POST /api/files` uploads files to S3 or Supabase (authorized user).  
8. `GET /api/audit-logs` lists admin actions (admin).

### Key Components
1. **LoginForm** handles user authentication via Supabase.  
2. **ChannelList** displays available channels and join/leave options.  
3. **ChannelView** shows message history, file uploads, and input field.  
4. **AdminUserList** manages user accounts and roles.  
5. **AdminChannelList** manages channel creation and archival.  
6. **AuditLogTable** lists admin actions for oversight.

## MVP Launch Requirements
1. Secure user authentication and role-based access via Supabase.  
2. Channel-based messaging with real-time updates.  
3. Basic file uploads to Supabase.  
4. Message editing, soft deletion, and moderation tools.  
5. Admin console for user management and channel oversight.  
6. Audit logging for admin actions.