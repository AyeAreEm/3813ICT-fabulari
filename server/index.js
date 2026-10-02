import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { attachChat } from './chat.js';
import { connectDB, getDB } from './db.js';
import { initUploads, serveUpload, deleteUpload, saveImage } from './files.js';

let chat = null;

const app = express();
const port = 3000;

function usersCollection() {
    return getDB().collection('users');
}
function groupsCollection() {
    return getDB().collection('groups');
}
function groupRequestsCollection() {
    return getDB().collection('groupRequests');
}
function createGroupRequestsCollection() {
    return getDB().collection('createGroupRequests');
}
function banRequestsCollection() {
    return getDB().collection('banRequests');
}
function deleteGroupRequestsCollection() {
    return getDB().collection('deleteGroupRequests');
}
function notificationsCollection() {
    return getDB().collection('notifications');
}
function messagesCollection() {
    return getDB().collection('messages');
}
function logsCollection() {
    return getDB().collection('logs');
}

async function findUserByEmail(email) {
    return usersCollection().findOne({ email }, { projection: { _id: 0 } });
}
async function findGroupById(id) {
    return groupsCollection().findOne({ id }, { projection: { _id: 0 } });
}
function isGroupAdmin(group, email) {
    return (group?.members ?? []).some(m => m.id === email && m.role === 'Admin');
}

async function log(actor, action) {
    await logsCollection().insertOne({dateTime: Date.now(), actor, action});
}

async function notify(userId, level, message) {
    await notificationsCollection().insertOne({
        id: crypto.randomUUID(),
        userId,
        level,
        message,
        date: Date.now(),
        read: false,
    });
}

async function purgeGroup(group) {
    const roomKeys = (group.rooms ?? []).map(r => group.id + ':' + r.id);

    if (roomKeys.length > 0) {
        const withFiles = await messagesCollection()
            .find({ room: { $in: roomKeys }, attachment: { $exists: true } }, { projection: { attachment: 1 } })
            .toArray();
        await Promise.all(withFiles.map(m => deleteUpload(m.attachment.url)));
        await messagesCollection().deleteMany({ room: { $in: roomKeys } });
    }

    await groupRequestsCollection().deleteMany({ groupId: group.id });
    await groupsCollection().deleteOne({ id: group.id });

    chat?.evictGroup(group.id);
}

app.use(express.json({limit: '5mb'}));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/uploads/:id', serveUpload);

app.post('/auth/signup', async (req, res) => {
    const { firstName, lastName, dob, email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
        res.status(400).json({status: "email already in use."});
        return;
    }

    const newuser = {firstName, lastName, dob, email, password, isSuperAdmin: false};
    await usersCollection().insertOne({ ...newuser });

    res.json(newuser);
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await usersCollection().findOne({ email, password }, { projection: { _id: 0 } });
    if (!user) {
        res.status(400).json({status: "Invalid credentials."});
        return;
    }

    if (user.isBanned) {
        res.status(403).json({status: "This account has been banned."});
        return;
    }

    const { password: pw, ...safeUser } = user;
    res.json(safeUser);
});

app.post('/create-group-requests', async (req, res) => {
    await createGroupRequestsCollection().insertOne({ ...req.body });
    res.status(200).send();
});

app.get('/create-group-requests', async (req, res) => {
    let createGroupRequests = await createGroupRequestsCollection().find({}, { projection: { _id: 0 } }).toArray();
    res.json(createGroupRequests);
});

app.patch('/create-group-requests/:id', async (req, res) => {
    let request = await createGroupRequestsCollection().findOne({ id: req.params.id }, { projection: { _id: 0 } });

    if (request && req.body.create) {
        let user = await findUserByEmail(request.requesterId);

        await groupsCollection().insertOne({
            id: crypto.randomUUID(),
            admin: request.requesterName,
            adminId: request.requesterId,
            name: request.proposedTitle,
            description: request.description,
            members: [{
                id: request.requesterId,
                name: user.firstName + " " + user.lastName,
                initials: user.firstName[0] + user.lastName[0],
                role: 'Admin',
                avatar: user.avatar,
            }],
            colour: "#ffffff",
        });

        await log("Super Admin", "Approved Create Group Request: " + request.proposedTitle);
        await notify(request.requesterId, 'success', "Your request to create group \"" + request.proposedTitle + "\" was approved. Group has been created.");
    } else {
        await log("Super Admin", "Denied Create Group Request: " + request.proposedTitle);
        await notify(request.requesterId, 'success', "Your request to create group \"" + request.proposedTitle + "\" was denied.");
    }

    await createGroupRequestsCollection().deleteOne({ id: req.params.id });

    res.status(200).send();
});

app.get('/groups', async (req, res) => {
    let groups = await groupsCollection().find({}, { projection: { _id: 0 } }).toArray();

    let sanitized = [];
    for (let g of groups) {
        sanitized.push({
            id: g.id,
            name: g.name,
            description: g.description,
            memberCount: g.members.length,
            ageRestriction: 13,
            icon: "",
            isMember: false,
        });
    }

    res.json(sanitized);
});

app.get('/groups/:id', async (req, res) => {
    let g = await findGroupById(req.params.id);
    let sanitized = {
        id: g.id,
        name: g.name,
        description: g.description,
        memberCount: g.members.length,
        ageRestriction: 13,
        icon: "",
        isMember: false,
        colour: g.colour,
    }

    res.json(sanitized);
});

app.post('/groups/:id/join-requests', async (req, res) => {
    await groupRequestsCollection().insertOne({
        id: crypto.randomUUID(),
        type: 'join',
        groupId: req.params.id,
        userId: req.body.userId,
        message: req.body.message,
        date: Date.now(),
    });

    res.status(200).send();
});

app.post('/groups/:id/room-requests', async (req, res) => {
    await groupRequestsCollection().insertOne({
        id: crypto.randomUUID(),
        type: 'room',
        groupId: req.params.id,
        userId: req.body.userId,
        roomName: req.body.name,
        message: req.body.reason,
        date: Date.now(),
    });

    res.status(200).send();
});

app.post('/groups/:id/kick-requests', async (req, res) => {
    const { userId, memberId, reason } = req.body;

    const group = await findGroupById(req.params.id);
    if (!group) {
        res.status(404).json({status: "Group not found."});
        return;
    }

    if (!userId || !memberId || typeof reason !== 'string' || !reason.trim()) {
        res.status(400).json({status: "A member and a reason are required."});
        return;
    }

    const requester = group.members.find(m => m.id === userId);
    if (!requester) {
        res.status(403).json({status: "You are not a member of this group."});
        return;
    }
    if (requester.role === 'Admin') {
        res.status(400).json({status: "Group Admins should submit a ban request instead."});
        return;
    }
    if (userId === memberId) {
        res.status(400).json({status: "You cannot request to kick yourself."});
        return;
    }

    const target = group.members.find(m => m.id === memberId);
    if (!target) {
        res.status(404).json({status: "That user is not a member of this group."});
        return;
    }
    if (target.role === 'Admin') {
        res.status(400).json({status: "Group Admins cannot be the target of a kick request."});
        return;
    }

    const duplicate = await groupRequestsCollection().findOne({ type: 'kick', groupId: group.id, userId, targetId: memberId });
    if (duplicate) {
        res.status(409).json({status: "You already have a pending kick request for this member."});
        return;
    }

    await groupRequestsCollection().insertOne({
        id: crypto.randomUUID(),
        type: 'kick',
        groupId: group.id,
        userId,
        targetId: memberId,
        message: reason.trim(),
        date: Date.now(),
    });

    res.status(200).send();
});

app.post('/groups/:id/ban-requests', async (req, res) => {
    const { requestorId, targetId, reason, sourceKickRequestId } = req.body;

    const group = await findGroupById(req.params.id);
    if (!group) {
        res.status(404).json({status: "Group not found."});
        return;
    }

    if (!isGroupAdmin(group, requestorId)) {
        res.status(403).json({status: "Only a Group Admin can request a platform ban."});
        return;
    }

    if (!targetId || typeof reason !== 'string' || !reason.trim()) {
        res.status(400).json({status: "A user and a reason are required."});
        return;
    }
    if (targetId === requestorId) {
        res.status(400).json({status: "You cannot request a ban on yourself."});
        return;
    }

    const target = group.members.find(m => m.id === targetId);
    if (!target) {
        res.status(404).json({status: "That user is not a member of this group."});
        return;
    }
    if (target.role === 'Admin') {
        res.status(400).json({status: "Group Admins cannot be the target of a ban request."});
        return;
    }

    if (sourceKickRequestId) {
        const source = await groupRequestsCollection().findOne({ id: sourceKickRequestId, groupId: group.id, type: 'kick', targetId });
        if (!source) {
            res.status(404).json({status: "Kick request not found."});
            return;
        }
    }

    const pending = await banRequestsCollection().findOne({ targetId, status: 'pending' });
    if (pending) {
        res.status(409).json({status: "A ban request for this user is already pending."});
        return;
    }

    await banRequestsCollection().insertOne({
        id: crypto.randomUUID(),
        requestorId,
        groupId: group.id,
        sourceKickRequestId: sourceKickRequestId ?? null,
        targetId,
        reason: reason.trim(),
        status: 'pending',
        date: Date.now(),
    });

    if (sourceKickRequestId) {
        await groupRequestsCollection().deleteOne({ id: sourceKickRequestId });
    }

    await log(requestorId, "Escalated Ban Request (" + group.name + "): " + target.name);

    res.status(200).send();
});

app.post('/groups/:id/delete-requests', async (req, res) => {
    const { requesterId, reason } = req.body;

    const group = await findGroupById(req.params.id);
    if (!group) {
        res.status(404).json({status: "Group not found."});
        return;
    }

    if (!isGroupAdmin(group, requesterId)) {
        res.status(403).json({status: "Only a Group Admin can request to delete this group."});
        return;
    }

    if (typeof reason !== 'string' || !reason.trim()) {
        res.status(400).json({status: "A reason is required."});
        return;
    }

    const pending = await deleteGroupRequestsCollection().findOne({ groupId: group.id, status: 'pending' });
    if (pending) {
        res.status(409).json({status: "A deletion request for this group is already pending."});
        return;
    }

    const requester = group.members.find(m => m.id === requesterId);

    await deleteGroupRequestsCollection().insertOne({
        id: crypto.randomUUID(),
        groupId: group.id,
        groupName: group.name,
        requesterId,
        requesterName: requester.name,
        reason: reason.trim(),
        status: 'pending',
        date: Date.now(),
    });

    res.status(200).send();
});

app.get('/groups/:id/delete-requests/pending', async (req, res) => {
    const pending = await deleteGroupRequestsCollection().findOne({ groupId: req.params.id, status: 'pending' }, { projection: { _id: 0 } });
    res.json({ pending: pending !== null, date: pending?.date ?? null });
});

app.patch('/groups/:gid/requests/:rid', async (req, res) => {
    let request = await groupRequestsCollection().findOne({ id: req.params.rid }, { projection: { _id: 0 } });

    if (!request) {
        res.status(404).json({status: "Request not found."});
        return;
    }

    let group = await findGroupById(req.params.gid);

    if (!group || request.groupId !== group.id) {
        res.status(404).json({status: "Group not found."});
        return;
    }

    if (!isGroupAdmin(group, req.body.actor)) {
        res.status(403).json({status: "Only a Group Admin can review requests."});
        return;
    }

    if (request.type === 'join') {
        let user = await findUserByEmail(request.userId);
        let name = user.firstName + " " + user.lastName;

        if (req.body.approve) {
            await groupsCollection().updateOne(
                { id: req.params.gid },
                { $push: { members: {
                    id: request.userId,
                    name: name,
                    initials: user.firstName[0] + user.lastName[0],
                    role: 'Member',
                    avatar: user.avatar,
                } } },
            );
            await log(req.body.actor, "Approved Join (" + group.name + "): " + name);
            await notify(request.userId, 'success', "Your request to join \"" + group.name + "\" was approved.")
        } else {
            await log(req.body.actor, "Denied Join (" + group.name + "): " + name);
            await notify(request.userId, 'warning', "Your request to join \"" + group.name + "\" was denied.");
        }
    } else if (request.type === 'room') {
        if (req.body.approve) {
            await groupsCollection().updateOne(
                { id: req.params.gid },
                { $push: { rooms: {
                    id: crypto.randomUUID(),
                    name: request.roomName,
                } } },
            );
            await log(req.body.actor, "Approved Room (" + group.name + "): " + request.roomName);
            await notify(request.userId, 'success', "Your request for room \"" + request.roomName + "\" was approved. Room has been created.");
        } else {
            await log(req.body.actor, "Denied Room (" + group.name + "): " + request.roomName);
            await notify(request.userId, 'warning', "Your request for room \"" + request.roomName + "\" was denied.");
        }
    } else if (request.type === 'kick') {
        let target = group.members.find(m => m.id === request.targetId);
        let targetName = target ? target.name : request.targetId;

        if (req.body.approve) {
            await groupsCollection().updateOne(
                { id: req.params.gid },
                { $pull: { members: { id: request.targetId } } },
            );
            await log(req.body.actor, "Approved Kick (" + group.name + "): " + targetName);
            await notify(request.userId, 'success', "Your kick request on \"" + group.name + "\" for \"" + targetName + "\" was approved. They have been kicked.");
        } else {
            await log(req.body.actor, "Denied Kick (" + group.name + "): " + targetName);
            await notify(request.userId, 'success', "Your kick request on \"" + group.name + "\" for \"" + targetName + "\" was denied.");
        }
    }

    await groupRequestsCollection().deleteOne({ id: req.params.rid });

    res.status(200).send();
});

app.get('/groups/:id/requests', async (req, res) => {
    let requests = await groupRequestsCollection().find({ groupId: req.params.id }, { projection: { _id: 0 } }).toArray();
    let users = await usersCollection().find({}, { projection: { _id: 0 } }).toArray();

    const nameOf = (email) => {
        let user = users.find(u => u.email === email);
        return user ? user.firstName + " " + user.lastName : 'Unknown';
    };

    let sanitized = [];
    for (let r of requests) {
        sanitized.push({
            id: r.id,
            type: r.type,
            subjectName: r.type === 'room' ? r.roomName : nameOf(r.type === 'kick' ? r.targetId : r.userId),
            targetId: r.type === 'kick' ? r.targetId : undefined,
            requesterName: r.type === 'kick' ? nameOf(r.userId) : undefined,
            message: r.message,
            date: r.date,
        });
    }

    res.json(sanitized);
});

app.get('/groups/:id/rooms', async (req, res) => {
    let group = await groupsCollection().findOne({ id: req.params.id }, { projection: { _id: 0, rooms: 1 } });
    res.json(group?.rooms ?? []);
});

app.get('/groups/:id/members', async (req, res) => {
    let group = await groupsCollection().findOne({ id: req.params.id }, { projection: { _id: 0, members: 1 } });
    res.json(group.members);
});

app.patch('/groups/:id/settings', async (req, res) => {
    let group = await findGroupById(req.params.id);
    let payload = req.body.payload;

    await groupsCollection().updateOne(
        { id: req.params.id },
        { $set: { description: payload.description, colour: payload.colour } }
    );

    res.status(200).send();
});

app.patch('/profile/:id', async (req, res) => {
    const { form, avatar } = req.body;
    let avatarUrl = avatar;

    const existingUser = await findUserByEmail(req.params.id);

    if (avatar && (avatar.startsWith('data:') || Buffer.isBuffer(avatar))) {
        let buffer;
        if (typeof avatar === 'string' && avatar.startsWith('data:')) {
            const base64Data = avatar.split(',')[1];
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            buffer = Buffer.from(avatar);
        }

        const uploadResult = await saveImage(buffer);

        if (uploadResult) {
            if (existingUser?.avatar && existingUser.avatar.startsWith('/uploads/')) {
                await deleteUpload(existingUser.avatar);
            }
            avatarUrl = uploadResult.url;
        }
    }

    await usersCollection().updateOne(
        { email: req.params.id },
        { 
            $set: { 
                firstName: form.firstName, 
                lastName: form.lastName, 
                dob: form.dob, 
                avatar: avatarUrl 
            } 
        }
    );

    await groupsCollection().updateMany(
        { "members.id": req.params.id },
        { $set: { "members.$.avatar": avatarUrl } }
    );

    const user = await findUserByEmail(req.params.id);
    res.json(user);
});

app.get('/profile/:id/groups', async (req, res) => {
    let theirs = await groupsCollection().find({ 'members.id': req.params.id }, { projection: { _id: 0 } }).toArray();

    let sanitized = [];
    for (let g of theirs) {
        sanitized.push({
            id: g.id,
            name: g.name,
            description: g.description,
            memberCount: g.members.length,
            ageRestriction: 13,
            icon: "",
            isMember: true,
        });
    }

    res.json(sanitized);
});

app.get('/admin/ban-requests', async (req, res) => {
    let requests = await banRequestsCollection().find({ status: 'pending' }, { projection: { _id: 0 } }).sort({ date: 1 }).toArray();
    let users = await usersCollection().find({}, { projection: { _id: 0 } }).toArray();
    let groups = await groupsCollection().find({}, { projection: { _id: 0, id: 1, name: 1 } }).toArray();

    const nameOf = (email) => {
        let user = users.find(u => u.email === email);
        return user ? user.firstName + " " + user.lastName : email;
    };

    let sanitized = [];
    for (let r of requests) {
        let group = groups.find(g => g.id === r.groupId);

        sanitized.push({
            id: r.id,
            proposedByName: nameOf(r.requestorId),
            proposedByRole: 'Group Admin' + (group ? ' of ' + group.name : ''),
            targetName: nameOf(r.targetId),
            targetId: r.targetId,
            evidence: r.reason,
            date: r.date,
        });
    }

    res.json(sanitized);
});

app.patch('/admin/ban-requests/:id', async (req, res) => {
    let request = await banRequestsCollection().findOne({ id: req.params.id, status: 'pending' }, { projection: { _id: 0 } });
    if (!request) {
        res.status(404).json({status: "Request not found."});
        return;
    }

    let target = await findUserByEmail(request.targetId);
    let targetName = target ? target.firstName + " " + target.lastName : request.targetId;

    if (req.body.ban) {
        if (target) {
            let adminOf = await groupsCollection().findOne({ members: { $elemMatch: { id: target.email, role: 'Admin' } } });
            if (adminOf) {
                res.status(409).json({status: targetName + " is a Group Admin of \"" + adminOf.name + "\" and must appoint a successor first."});
                return;
            }

            await usersCollection().updateOne({ email: target.email }, { $set: { isBanned: true } });
            await groupsCollection().updateMany(
                { 'members.id': target.email },
                { $pull: { members: { id: target.email } } },
            );
            await groupRequestsCollection().deleteMany({ $or: [{ userId: target.email }, { targetId: target.email }] });
        }

        await banRequestsCollection().updateOne({ id: request.id }, { $set: { status: 'approved' } });
        await log("Super Admin", "Approved Ban Request: " + targetName);
    } else {
        await banRequestsCollection().updateOne({ id: request.id }, { $set: { status: 'denied' } });
        await log("Super Admin", "Denied Ban Request: " + targetName);
    }

    res.status(200).send();
});

app.get('/admin/delete-requests', async (req, res) => {
    let requests = await deleteGroupRequestsCollection().find({ status: 'pending' }, { projection: { _id: 0 } }).sort({ date: 1 }).toArray();

    let sanitized = [];
    for (let r of requests) {
        sanitized.push({
            id: r.id,
            requesterName: r.requesterName,
            groupName: r.groupName,
            reason: r.reason,
            date: r.date,
        });
    }

    res.json(sanitized);
});

app.post('/admin/delete-requests/:id/confirm', async (req, res) => {
    let request = await deleteGroupRequestsCollection().findOne({ id: req.params.id, status: 'pending' }, { projection: { _id: 0 } });
    if (!request) {
        res.status(404).json({status: "Request not found."});
        return;
    }

   let group = await findGroupById(request.groupId);
    if (group) {
        await purgeGroup(group);
    }

    await deleteGroupRequestsCollection().updateOne({ id: request.id }, { $set: { status: 'approved', resolvedDate: Date.now() } });
    await notify(request.requesterId, 'success', "Your request to delete \"" + request.groupName + "\" was approved.");
    await log("Super Admin", "Approved Delete Group Request: " + request.groupName);

    res.status(200).send();
});

app.post('/admin/delete-requests/:id/deny', async (req, res) => {
    let request = await deleteGroupRequestsCollection().findOne({ id: req.params.id, status: 'pending' }, { projection: { _id: 0 } });
    if (!request) {
        res.status(404).json({status: "Request not found."});
        return;
    }

    await deleteGroupRequestsCollection().updateOne({ id: request.id }, { $set: { status: 'denied', resolvedDate: Date.now() } });
    await notify(request.requesterId, 'warning', "Your request to delete \"" + request.groupName + "\" was denied.");
    await log("Super Admin", "Denied Delete Group Request: " + request.groupName);

    res.status(200).send();
});

app.get('/notifications/:userId', async (req, res) => {
    let notifications = await notificationsCollection()
        .find({ userId: req.params.userId }, { projection: { _id: 0, userId: 0 } })
        .sort({ date: -1 })
        .limit(30)
        .toArray();

   res.json(notifications);
});

app.patch('/notifications/:userId/read', async (req, res) => {
    await notificationsCollection().updateMany({ userId: req.params.userId, read: false }, { $set: { read: true } });
    res.status(200).send();
});

app.get('/admin/logs', async (req, res) => {
    let logs = await logsCollection().find({}, {projection: { _id: 0 }}).toArray();
    res.json(logs);
})

const server = createServer(app);

try {
    await connectDB();
} catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    console.error(`Make sure MongoDB is running and reachable (checked ${process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017'}).`);
    process.exit(1);
}

await initUploads();

chat = await attachChat(server, { findUserByEmail, findGroupById });

server.listen(port, async () => {
    console.log("running on " + port);

    const adminExists = (await usersCollection().findOne({ isSuperAdmin: true })) !== null;

    if (!adminExists) {
        const rl = readline.createInterface({input, output});
        console.log("Super Admin not detected... Creating one.");

        try {
            const dob = await rl.question("DOB (YYYY-MM-DD): ");
            const email = await rl.question("Email: ");
            const password = await rl.question("Password: ");

            await usersCollection().insertOne({firstName: "Super", lastName: "Admin", dob, email, password, isSuperAdmin: true});
            console.log("Super Admin created.");
        } finally {
            rl.close();
        }

    }
});
