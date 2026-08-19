# Fabulari Phase 1

## Overview
Fabulari means "to chat" in Latin.
Fabulari is a real-time bulletin-board style chat application with groups and chat rooms that supports text and media.

### Groups
Groups are a collection of chat rooms. A Chat room contains several users above an age specified on creation of the room.
Groups have titles with a maximum of 30 letters. They will also have a description of up to 250 letters.
They will have a minimum age limit to join the group.
Groups display a list of all users in said group.

### Roles
There are three roles: Super Admin, Group Admin, and Chatter.

#### Super Admin
The Super Admin is the admin of the entire application. They create and delete groups as well as ban users from the application.
They do not have chatting functions. They are created by default when the application first runs.
Users can send requests to the Super Admin asking to create a new group and delete a group.
Groups Admins can ask the Super Admin to ban a user from the system.

#### Group Admin
The Group Admin is the admin of their respective group. They create and delete chat rooms in their group as well as kick users from the group.
They do have chatting functions.
Users can request to join a group where the Group Admin will approve or deny their request.
The Group Admin can leave their group or delete their account but will have to appoint another user as the new Group Admin before leaving.
They can change the description of their group but not it's name.
They can customise the background colour of the chat rooms.

#### Chatter
A Chatter is a regular user with chatting functions. A Group Admin counts as a Chatter but with administrative funtions.
The information about a chatter are as follows: first name, last name, e-mail, password, age.
A Chatter can send a request to ban another user from the group to the Group Admin where the Group Admin can choose to either ban them from the group or send a request to the Super Admin to ban them from the system.
They can delete their previous message.
Chatters can see a list of all existing groups for them to send a join request to the Group Admin.

## Misc. Information
- There will be logs of all administrative actions.
- Chat rooms show the previous 5 messages to newly joined chatters.
- Chatters are notified when a user joins and leaves the chat room.
- Media files (PNG, JPEG, GIF) must be <2MB.
- Markdown text is supported in the chat.
- UI customisation on users' profile page as well as by Group Admins for their group.
- Links to other places on the site *are* hyperlinked, other links are *not* hyperlinked.
- Passwords must be >= 8 characters with at least 1 uppercase letter.
- Messages are time stamped.
- Users can update all their information except for their email. If a user forgets their password, they have to create a new account.

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
|  |  |
| - | - |
|  |  |

## Data Structures

## Angular Architecture
### Components

### Services

### Models

### Routes

## Endpoints

## Design Documents
