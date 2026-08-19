# Fabulari Phase 1

## Overview
Fabulari means "to chat" in Latin.
Fabulari is a real-time bulletin-board style chat application with groups and chat rooms that supports text and media.

### Groups
Groups are a collection of chat rooms. A Chat room contains several users above an age specified on creation of the room.

### Roles
There are three roles: Super Admin, Group Admin, and Member.

#### Super Admin
The Super Admin is the administrator of the entire application, responsible for creating / deleting groups and banning users from the app.
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
| 1 | Super Admin account is created by default on first app run | A setup script creates the Super Admin account with a configured email and password on deployment |
| 2 | Users send group creation / deletion requests to Super Admin | Super Admin sees a list of pending requests to approve or deny each one |
| 3 | Group Admins send ban requests to Super Admin | Request has a reason field |
| 4 | Groups have a title <= 30 characters, description <= 200 characters, and minimum age | Title must be unique. Age limit is enforced join-request time |
| 5 | Groups display a list of all members | Visible to all members, not only Group Admin |
| 6 | Group Admin approves or denies join request | Requester is notified of outcome |
| 7 | Group Admin can edit group description but not title | Editing the description is logged |
| 8 | Group Admin can customise group background colour | Choice of colour from a preset palette to avoid readablity issues |
| 9 | Group Admin must appoint a successor before leaving or deleting their account | Only chatters of the same group are eligible |
| 10 | Profile requires first name, last name, email, password, and age | Age is taken from date of birth for recalculation |
| 11 | Members can request for another member to be banned from the group | Request goes to Group Admin where they can ask the Super Admin to ban the user from the app, ban them from the group, or deny the request |
| 12 | Members can delete their previous messages | Message is replaced with "message deleted" rather than completely removed from the UI |
| 13 | Users can view a list of all existing groups | List shows title, description, age limit, but not the full member list |
| 14 | Members entering a chat room see 5 previous messages | Database stores only 5 messages and continously updates using a Ring Buffer approach |
| 15 | Members in a chat room are notified when another member enters or leaves said chat room | Notified with an inline message rather than push notification |
| 16 | Media files (PNG, JPEG, GIF) must be <=2MB | Files over 2MB are rejected on the front-end before reaching the server |
| 17 | Markdown support in chat messages | Limited subset of markdown for security |
| 18 | Internal links are hyperlinked, external are not | Server Side detection between internal and external links |
| 19 | Passwords must be >= 8 characters with 1 uppercase character | Numbers and symbols need not be included |
| 20 | Messages are timestamped | Timestamps are stored in UTC and displayed in the users' local timezone |
| 21 | Users can update all their information except email | Passwords can be changed if user knows old password. They cannot reset their forgotten password |
| 22 | All administrative actions are logged | Logs include email, action, target, and timestamp. Visible only to the Super Admin |

## Data Structures

## Angular Architecture
### Components

### Services

### Models

### Routes

## Endpoints

## Design Documents
