snumber: s5444721
name: Adrian Mehta
workshop time: On-campus Thursday 11:00am

# Fabulari Phase 2

## Overview
Fabulari means "to chat" in Latin.
Fabulari is a real-time non-persistent chat application with groups and chat rooms that supports text and media.

### Groups
Groups are a collection of chat rooms. A Chat room contains several users above an age specified on creation of the group.

### Roles
There are three roles: Super Admin, Group Admin, and Member.

#### Super Admin
The Super Admin is the administrator of the entire application, responsible for creating / deleting groups and banning users from the platform.
They do not have chatting functions.

#### Group Admin
The Group Admin is the administrator of their respective group, responsible for creating / deleting chat rooms and banning users from the group.
Group Admins have chatting functions.

#### Member
A Member is a regular user with chatting functions.

## Git Strategy Outline
### Branches
All branches will be prefixed depending on the goal of the branch. The name of the branch will be [prefix]/[name].

| Prefix | Definition |
| ------ | ---------- |
| feat | new feature |
| bug | fixing a bug |
| wip | work-in-progress |

### Rebasing and Merging
To keep a clean commit history, rebasing will be used in tandem with merging.
Merging will occur for major feature and work-in-progress branches.
Rebasing will occur for documents / non-technical changes as well as minor bug fixes.

## Specifications and Assumptions
| ID | Requirement | Assumption |
| - | - | - |
| R1 | Super Admin account is created by default on first app run | A setup script creates the Super Admin account with a configured email and password on deployment |
| R2 | Users send group creation / deletion requests to Super Admin | Super Admin sees a list of pending requests to approve or deny each one |
| R3 | Group Admins send ban requests to Super Admin | Request has a reason field |
| R4 | Groups have a title <= 30 characters, description <= 250 characters, and minimum age | Title must be unique. Age limit is enforced join-request time |
| R5 | Groups display a list of all members | Visible to all members, not only Group Admin |
| R6 | Group Admin approves or denies join request | Requester is notified of outcome |
| R7 | Group Admin can edit group description but not title | Editing the description is logged |
| R8 | Group Admin can customise group background colour | Choice of colour from a preset palette to avoid readablity issues |
| R9 | Group Admin must appoint a successor before leaving or deleting their account | Only chatters of the same group are eligible |
| R10 | Profile requires first name, last name, email, password, and age | Age is taken from date of birth for recalculation |
| R11 | Members can request for another member to be banned from the group | Request has a reason field. Request goes to Group Admin where they can ask the Super Admin to ban the user from the platform, ban them from the group, or deny the request |
| R12 | Members can delete their previous messages | Previous messages (after the 5th) are cached in sessionStorage. Message is replaced with "message deleted" rather than completely removed from the UI |
| R13 | Users can view a list of all existing groups | List shows title, description, age limit, but not the full member list |
| R14 | Members entering a chat room see 5 previous messages | Database stores only 5 messages and continously updates using a Ring Buffer approach |
| R15 | Members in a chat room are notified when another member enters or leaves said chat room | Notified with an inline message rather than push notification |
| R16 | Media files (PNG, JPEG, GIF) must be <=2MB | Files over 2MB are rejected on the front-end for immediate feedback and re-validated server-side |
| R17 | Internal links are hyperlinked, external are not | Server Side detection between internal and external links |
| R18 | Passwords must be >= 8 characters with 1 uppercase character | Numbers and symbols need not be included |
| R19 | Messages are timestamped | Timestamps are stored in UTC and displayed in the users' local timezone |
| R20 | Users can update all their information except email | Passwords can be changed if user knows old password. They cannot reset their forgotten password |
| R21 | All administrative actions are logged | Logs include userId, action, and timestamp. Visible only to the Super Admin |
| R22 | Rooms display a list of users currently in the room | Presence is tracked server-side in memory (not MongoDB) and pushed to clients via WebSocket |
| R23 | Members can request for a new room to be created in a group | Request has a room name and reason |

## Data Structures
The user's email is used as the user id throughout the API. Group members and rooms are embedded in the group document.

### User (users)
The Super Admin is stored as a User with `isSuperAdmin` set to true.

| Field | Type | Notes |
| - | - | - |
| firstName | string | (R10) |
| lastName | string | (R10) |
| email | string, unique | Used as the user id. Cannot change after creation (R20) |
| password | string | >= 8 chars, 1 uppercase (R18) |
| dob | string (date) | Date-of-birth for age (R10) |
| avatar | string, optional | URL of the uploaded profile image (`/uploads/:id`) |
| isSuperAdmin | boolean | (R1) |
| isBanned | boolean, optional | Set when a ban request is approved (R3) |

### Group (groups)
| Field | Type | Notes |
| - | - | - |
| id | UUID |  |
| admin | string | Name of the creating Group Admin |
| adminId | string | References User.email |
| name | string | Group title |
| description | string | Editable and logged (R7, R21) |
| colour | string | Hexcode from the preset palette (R8) |
| members | []Member | Embedded, see Member below |
| rooms | []Room | Embedded, added when a room request is approved |

### Member (embedded in Group)
| Field | Type | Notes |
| - | - | - |
| id | string | References User.email |
| name | string |  |
| initials | string |  |
| role | enum | Admin, Member |
| avatar | string, optional |  |

### Room (embedded in Group)
| Field | Type | Notes |
| - | - | - |
| id | UUID |  |
| name | string | (R23) |

### GroupRequest (groupRequests)
Join, room and kick requests share one collection and are told apart by `type`.

| Field | Type | Notes |
| - | - | - |
| id | UUID |  |
| type | enum | join, room, kick |
| groupId | UUID | References Group.id |
| userId | string | References User.email (requester) |
| targetId | string, kick only | References User.email (member to kick) (R11) |
| roomName | string, room only | (R23) |
| message | string | Introduction, reason |
| date | number | Epoch ms |

### CreateGroupRequest (createGroupRequests)
| Field | Type | Notes |
| - | - | - |
| id | UUID |  |
| requesterId | string | References User.email |
| requesterName | string |  |
| proposedTitle | string |  |
| description | string |  |
| ageRestriction | number | (R4) |
| date | string |  |

### DeleteGroupRequest (deleteGroupRequests)
| Field | Type | Notes |
| - | - | - |
| id | UUID |  |
| groupId | UUID | References Group.id |
| groupName | string |  |
| requesterId | string | References User.email |
| requesterName | string |  |
| reason | string |  |
| status | enum | pending, approved, denied (R2) |
| date | number | Epoch ms |
| resolvedDate | number, optional |  |

### BanRequest (banRequests)
| Field | Type | Notes |
| - | - | - |
| id | UUID |  |
| requestorId | string | References User.email (Group Admin) |
| groupId | UUID | References Group.id |
| sourceKickRequestId | UUID nullable | References GroupRequest.id, null when raised directly (R11) |
| targetId | string | References User.email |
| reason | string | (R3) |
| status | enum | pending, approved, denied |
| date | number | Epoch ms |

### Message (messages)
| Field | Type | Notes |
| - | - | - |
| room | string | `groupId:roomId` |
| id | UUID |  |
| authorId | string | References User.email |
| authorName | string |  |
| initials | string |  |
| timestamp | string (ISO) | UTC (R19) |
| text | string | <= 2000 characters |
| attachment | Attachment, optional | See below (R16) |

### Attachment (embedded in Message)
| Field | Type | Notes |
| - | - | - |
| url | string | `/uploads/:id` |
| type | string | image/png, image/jpeg, image/gif |
| size | number | <= 2MB (R16) |
| name | string |  |

### Upload (uploads)
| Field | Type | Notes |
| - | - | - |
| id | UUID | Unique index |
| type | string | Detected from file bytes, not file name |
| size | number |  |
| data | binary |  |
| date | number | Epoch ms |

### Notification (notifications)
| Field | Type | Notes |
| - | - | - |
| id | UUID |  |
| userId | string | References User.email |
| level | enum | success, warning, info |
| message | string | (R6) |
| date | number | Epoch ms |
| read | boolean |  |

### Log (logs)
| Field | Type | Notes |
| - | - | - |
| dateTime | number | Epoch ms (R21) |
| actor | string | User email or "Super Admin" |
| action | string |  |

### RoomPresence (in memory only)
| Field | Type | Notes |
| - | - | - |
| roomKey | string | `groupId:roomId` |
| socketId | string | Removed on disconnect (R22) |
| user | object | id, name, initials, role |

## Database Considerations (MongoDB)
### Reference Integrity
MongoDB does not enforce foreign keys. All fields referencing another collection (userId, groupId, targetId) are validated server-side.

### Collections
| Collection | Contents |
| - | - |
| users | Users and the Super Admin |
| groups | Groups with embedded members and rooms |
| groupRequests | Join, room and kick requests |
| createGroupRequests | Pending group creation requests |
| deleteGroupRequests | Group deletion requests |
| banRequests | Platform ban requests |
| messages | Last 5 messages per room (R14) |
| uploads | Uploaded images |
| notifications | Per-user notifications |
| logs | Admin action logs |

### Unique Indexes
| Collection | Field | Notes |
| - | - | - |
| uploads | id | Created on server start |
| users | email | Checked in code on signup (R20) |

### Embedded vs. Referenced Documents
| Structure | Storage | Rationale |
| - | - | - |
| Group.members, Group.rooms | Embedded array | Single document read for group pages (R5) |
| Messages | Separate collection, capped at 5 per room by the server | Single query for (R14) |

## Angular Architecture
### Components
All components are postfixed with "Component" in the codebase.
| Component | Description |
| --------- | ----------- |
| Home | Landing page that links to the application |
| Signup | Sign up form (first name, last name, DOB, email, password, confirm password) |
| Login | Login form |
| Profile | Edit profile details and picture, logout |
| ChangePassword | Change password form |
| Shell | Top bar, notifications and "My Groups" sidebar wrapping a page |
| GroupNav | Room list for a group with create room request button |
| BrowseGroups | List of all groups, join and create group modals |
| GroupCard | Single group in the browse list |
| GroupDetails | Group title, description and member list |
| GroupSettings | Edit description, colour, appoint successor, request delete |
| Room | Chat room with messages, input and file upload |
| CreateRoomRequest | Form to request a room |
| KickRequest | Form to request a member be removed from a group |
| BanRequest | Form to request a platform ban (Group Admin) |
| GroupRequests | Join, room and kick requests for a Group Admin |
| AdminShell | Super Admin layout and navigation |
| CreateGroupRequests | Pending group creation requests |
| DeleteGroupRequests | Pending group deletion requests |
| BanRequests | Pending platform ban requests |
| AdminLogs | Searchable table of admin logs |
| Modal | Overlay that displays content on top of the page |

### Services
All services (except for guards and validators) are postfixed with "Service" in the codebase.
| Service | Description |
| ------- | ----------- |
| AuthService | Login, signup, logout, profile update and current user storage |
| ChatService | Socket.IO connection, room join/leave, send message/file |
| GroupService | Group, room, member and group request calls |
| NotificationService | Get and mark notifications read |
| AdminService | Super Admin requests and logs |
| authGuard | Redirects to login when not logged in |
| homeGuard | Redirects logged in users from home to groups |
| superAdminGuard | Restricts routes to the Super Admin |
| passwordStrength / passwordsMatch | Form validators for (R18) |

### Models
| Model | Description |
| ----- | ----------- |
| AuthUser | Logged in user |
| SignupPayload | Signup form values |
| Group | Group summary shown in lists |
| Room | Room id and name |
| Member | Group member and role |
| Message | Chat message |
| Attachment | Image attached to a message |
| RoomNotice | "joined" / "left" notice |
| PresenceUser | User currently in a room |
| FeedItem | Message or notice in the chat feed |
| GroupRequest | Join, room or kick request |
| CreateGroupRequest | Group creation request |
| DeleteGroupRequest | Group deletion request |
| BanRequest | Platform ban request |
| AppNotification | Notification shown in the Shell |
| AuditLogEntry | Admin log entry |

### Routes
| Path | Component(s) | Guard(s) |
| ---- | ------------ | -------- |
| / | Home | homeGuard |
| /login | Login |  |
| /signup | Signup |  |
| /profile | Profile | authGuard |
| /change-password | ChangePassword | authGuard |
| /groups | BrowseGroups (Shell, GroupCard, Modal) | authGuard |
| /groups/:id | GroupDetails (Shell, GroupNav, GroupSettings) | authGuard |
| /groups/:id/rooms/:roomId | Room (Shell, GroupNav) | authGuard |
| /groups/:id/requests | GroupRequests (Shell, GroupNav) | authGuard |
| /groups/:id/kick-request | KickRequest (Shell, GroupNav) | authGuard |
| /groups/:id/ban-request | BanRequest (Shell, GroupNav) | authGuard |
| /admin | CreateGroupRequests (AdminShell) | superAdminGuard |
| /admin/create-requests | CreateGroupRequests (AdminShell, Modal) | superAdminGuard |
| /admin/delete-requests | DeleteGroupRequests (AdminShell, Modal) | superAdminGuard |
| /admin/ban-requests | BanRequests (AdminShell, Modal) | superAdminGuard |
| /admin/logs | AdminLogs (AdminShell) | superAdminGuard |

## Endpoints
The server runs on port 3000. Errors are returned as `{ "status": "message" }`.

### Auth
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /auth/signup | post | firstName, lastName, dob, email, password | 200 user, 400 email in use | Create an account |
| /auth/login | post | email, password | 200 user (no password), 400 invalid, 403 banned | Validate account credentials |

### Profile
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /profile/:id | patch | form (firstName, lastName, dob), avatar (data URL or null) | 200 updated user | Update profile (:id is the email) |
| /profile/:id/groups | get |  | 200 Group[] | Groups a user is a member of |

### Groups
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /groups | get |  | 200 Group[] (id, name, description, memberCount, ageRestriction*, icon, isMember) | Get all groups, no member list (R13) |
| /groups/:id | get |  | 200 Group + colour | Get a single group |
| /groups/:id/rooms | get |  | 200 Room[] | Rooms in a group |
| /groups/:id/members | get |  | 200 Member[] | Members of a group (R5) |
| /groups/:id/settings | patch | payload (description, colour) | 200 | Update group settings (R7, R8) |

### Group Requests (Create / Delete)
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /create-group-requests | post | id, requesterId, requesterName, proposedTitle, description, ageRestriction, date | 200 | Submit a request to create a group |
| /create-group-requests | get |  | 200 CreateGroupRequest[] | Pending requests for Super Admin |
| /create-group-requests/:id | patch | create (boolean) | 200 | Approve or deny group creation, requester notified, logged |
| /groups/:id/delete-requests | post | requesterId, reason | 200, 400, 403, 404, 409 | Group Admin requests group deletion |
| /groups/:id/delete-requests/pending | get |  | 200 { pending, date } | Is a deletion request pending |
| /admin/delete-requests | get |  | 200 DeleteGroupRequest[] | Pending requests for Super Admin |
| /admin/delete-requests/:id/confirm | post |  | 200, 404 | Approve and delete the group, its messages and requests |
| /admin/delete-requests/:id/deny | post |  | 200, 404 | Deny group deletion |

### Join, Room and Kick Requests
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /groups/:id/join-requests | post | userId, message | 200 | Submit a request to join a group (R6) |
| /groups/:id/room-requests | post | userId, name, reason | 200 | Submit a request to create a room (R23) |
| /groups/:id/kick-requests | post | userId, memberId, reason | 200, 400, 403, 404, 409 | Submit a request to remove a member from the group (R11) |
| /groups/:id/requests | get |  | 200 GroupRequest[] | Pending join, room and kick requests for Group Admin |
| /groups/:gid/requests/:rid | patch | actor, approve (boolean) | 200, 403 not Group Admin, 404 | Approve or deny a request, requester notified, logged |

### Ban Requests
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /groups/:id/ban-requests | post | requestorId, targetId, reason, sourceKickRequestId (optional) | 200, 400, 403, 404, 409 | Group Admin requests a platform ban |
| /admin/ban-requests | get |  | 200 BanRequest[] | Pending requests for Super Admin |
| /admin/ban-requests/:id | patch | ban (boolean) | 200, 404, 409 target is a Group Admin | Ban the user from the platform or deny |

### Notifications
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /notifications/:userId | get |  | 200 AppNotification[] (latest 30) | Get notifications |
| /notifications/:userId/read | patch |  | 200 | Mark all notifications read |

### Uploads
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /uploads/:id | get |  | 200 image bytes, 404 | Serve an uploaded image |

### Admin
| Endpoint | Method | Body | Response | Description |
| -------- | ------ | ---- | -------- | ----------- |
| /admin/logs | get |  | 200 AuditLogEntry[] | List of all logs (R21) |

### WebSocket Events
The socket connects with `auth: { email }`. Banned or unknown users are rejected with `unauthorized`.

| Event | Direction | Description |
| -------- | --------- | ----------- |
| `room:join` | client to server | `{ groupId, roomId }`, ack returns `{ ok, history, users }` or `{ ok: false, error }` (members only) |
| `room:leave` | client to server | Leave the current room |
| `message:send` | client to server | `{ text }` (<= 2000 characters), ack `{ ok }` or `{ ok: false, error }` |
| `file:send` | client to server | `{ fileName, fileType, fileSize, data }` PNG, JPEG or GIF <= 2MB, ack `{ ok }` or `{ ok: false, error }` (R16) |
| `message:new` | server to client | Broadcast new message to the room |
| `room:userJoined` | server to client | Broadcast when a user joins a room (R15) |
| `room:userLeft` | server to client | Broadcast when a user leaves a room (R15) |
| `room:presence` | server to client | Current list of users in the room (R22) |
| `group:deleted` | server to client | Sent to users in a room of a deleted group |

## Testing
### Tools and Methodology
| Area | Tools | Approach |
| ---- | ----- | -------- |
| Server | Mocha, Chai, built-in `fetch`, socket.io-client | Black-box tests against the running server. A global `before` hook seeds a separate database (`MONGODB_DB=fabulari_test`) directly with MongoClient (including a Super Admin, so the setup prompt does not block), starts `node index.js` as a child process and waits for "running on 3000". An `after` hook stops the server and drops the test database. Each test seeds its own users and groups with unique emails and ids so tests do not depend on each other. Seeded groups always include a `members` array. |
| Angular | Vitest (`ng test`), TestBed, HttpTestingController | Unit tests with mocked services (`vi.fn()`, RxJS `of`). HTTP services are tested with `provideHttpClient()` and `provideHttpClientTesting()`. Router navigation is checked with a spy on `Router`. |

### Server Tests
| ID | Target | Test | Expected Result |
| -- | ------ | ---- | --------------- |
| S1 | POST /auth/signup | Valid new user | 200, body has the email and `isSuperAdmin` false |
| S2 | POST /auth/signup | Email already used | 400, status "email already in use." |
| S3 | POST /auth/login | Correct credentials | 200, body has the email and no `password` |
| S4 | POST /auth/login | Wrong password | 400, status "Invalid credentials." |
| S5 | GET /groups | Seeded group exists | 200, array contains the group with correct `memberCount` and no `members` field (R13) |
| S6 | PATCH /groups/:id/settings | Send new description and colour | 200, GET /groups/:id returns the new description and colour |
| S7 | PATCH /profile/:id | Update first name, last name, dob (avatar null) | 200, returned user has the new names and the same email |
| S8 | POST + GET /create-group-requests | Submit a request | 200, GET list contains the request |
| S9 | PATCH /create-group-requests/:id | `create: true` | 200, group appears in GET /groups and request is removed |
| S10 | PATCH /create-group-requests/:id | `create: false` | 200, no group created and request is removed |
| S11 | POST /groups/:id/join-requests | Submit a join request | 200, GET /groups/:id/requests lists it with type `join` |
| S12 | PATCH /groups/:gid/requests/:rid | Group Admin approves a join request | 200, user appears in GET /groups/:id/members as Member |
| S13 | PATCH /groups/:gid/requests/:rid | Actor is not a Group Admin | 403, members unchanged |
| S14 | POST /groups/:id/kick-requests | Member requests another member be kicked | 200, listed in GET /groups/:id/requests with type `kick` |
| S15 | POST /groups/:id/kick-requests | Blank reason | 400 |
| S16 | POST /groups/:id/ban-requests | Group Admin requests a ban on a member | 200, listed in GET /admin/ban-requests |
| S17 | POST /groups/:id/ban-requests | Requestor is not a Group Admin | 403 |
| S18 | PATCH /admin/ban-requests/:id | `ban: true` | 200, login for that user returns 403 and they are removed from the group |
| S19 | POST /groups/:id/delete-requests | Group Admin submits a reason | 200, GET /groups/:id/delete-requests/pending returns `pending: true` |
| S20 | POST /admin/delete-requests/:id/confirm | Confirm a pending request | 200, group no longer in GET /groups |
| S21 | GET /admin/logs | After approving a create group request | 200, contains an "Approved Create Group Request" entry |
| S22 | Socket handshake | Connect with an unknown email | `connect_error` with message `unauthorized` |
| S23 | `room:join` | Member joins a seeded room | Ack `ok: true`, `history` is an array and `users` includes the member |
| S24 | `room:join` | User who is not in the group joins | Ack `ok: false`, error "You are not a member of this group." |
| S25 | `message:send` | Two members in a room, one sends "hello" | Ack `ok: true`, the other client receives `message:new` with the text |
| S26 | `message:send` | Send 6 messages, then join the room again | Joined history contains only 5 messages (R14) |
| S27 | `file:send` | Send non-image bytes | Ack `ok: false`, error "File type unsupported." (R16) |

### Angular Tests
| ID | Target | Test | Expected Result |
| -- | ------ | ---- | --------------- |
| C1 | passwordStrength | "Password1" | Returns null |
| C2 | passwordStrength | "password" (no uppercase) | Returns `{ weakPassword: true }` (R18) |
| C3 | authGuard | User logged in | Returns true |
| C4 | authGuard | User not logged in | Returns a UrlTree for `/login` with `returnUrl` |
| C5 | superAdminGuard | Logged in as a regular user | Returns a UrlTree for `/groups` |
| C6 | AuthService.login | Server returns the user | Emits true, user saved in localStorage, `currentUser` set |
| C7 | AuthService.login | Server returns 400 | Emits false, `currentUser` is null |
| C8 | GroupService.requestKick | Call with group, member and reason | POST to `/groups/:id/kick-requests` with the current user's email as `userId` |
| C9 | AdminService.banUser | Call with a request id | PATCH to `/admin/ban-requests/:id` with `{ ban: true }` |
| C10 | ChatService.sendMessage | Called while not connected | Observable errors "Not connected to the chat server." |
| C11 | LoginComponent | Submit empty form | `AuthService.login` not called |
| C12 | LoginComponent | Submit valid form (login mocked to succeed) | `login` called with the form values and navigates to `/groups` |
| C13 | SignupComponent | Passwords do not match | Form invalid and `AuthService.signup` not called |
| C14 | SignupComponent | Submit valid form (signup mocked to succeed) | `signup` called and navigates to `/groups` |
| C15 | GroupCardComponent | Group where `isMember` is false | Button text is "Request to Join" |
| C16 | GroupCardComponent | Group where `isMember` is true, click button | Button text is "View Group" and `action` emits the group |
| C17 | BrowseGroupsComponent | My groups contains 1 of 2 groups | `groups()` marks only that group as `isMember` |
| C18 | ProfileComponent | Load with a current user | Email control is disabled (R20) |
| C19 | ProfileComponent | Submit valid form | `AuthService.updateProfile` called with the user's email and form values |
| C20 | RoomComponent | Chat service emits a message | Message is added to `feed()` as type `message` |
| C21 | RoomComponent | Open `/groups/g1/rooms/r1` | `ChatService.joinRoom` called with `g1` and `r1` |

## Design Documents
### Home
![home page](storyboards/home.png)

### Login
![login page](storyboards/login.png)

### Signup
![signup page](storyboards/signup.png)

### Profile
![profile page](storyboards/profile.png)

### Change Password
![change password](storyboards/change_password.png)

### Groups
![browse groups](storyboards/browse_groups.png)
![group join](storyboards/group_join.png)
![group details](storyboards/group_details.png)
![group settings](storyboards/group_settings.png)
![group requests](storyboards/group_requests.png)

### Room
![room](storyboards/room.png)

### Request Forms
![kick request](storyboards/kick_request.png)
![ban request](storyboards/ban_request.png)

### Super Admin
![create group requests](storyboards/create_group_requests.png)
![delete group requests](storyboards/delete_group_requests.png)
![ban requests](storyboards/ban_requests.png)
![logs](storyboards/logs.png)
