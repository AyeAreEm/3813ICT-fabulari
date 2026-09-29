import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { attachChat } from './chat.js';
import { connectDB, getDB } from './db.js';

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

async function findUserByEmail(email) {
    return usersCollection().findOne({ email }, { projection: { _id: 0 } });
}
async function findGroupById(id) {
    return groupsCollection().findOne({ id }, { projection: { _id: 0 } });
}

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

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
            }],
        });
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

app.patch('/groups/:gid/requests/:rid', async (req, res) => {
    let request = await groupRequestsCollection().findOne({ id: req.params.rid }, { projection: { _id: 0 } });

    if (!request) {
        res.status(404).json({status: "Request not found."});
        return;
    }

    if (request.type === 'join') {
        if (req.body.approve) {
            let user = await findUserByEmail(request.userId);

            await groupsCollection().updateOne(
                { id: req.params.gid },
                { $push: { members: {
                    id: request.userId,
                    name: user.firstName + " " + user.lastName,
                    initials: user.firstName[0] + user.lastName[0],
                    role: 'Member',
                } } },
            );
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
        }
    }

    // TODO: handle 'kick' request type

    await groupRequestsCollection().deleteOne({ id: req.params.rid });

    res.status(200).send();
});

app.get('/groups/:id/requests', async (req, res) => {
    let requests = await groupRequestsCollection().find({ groupId: req.params.id }, { projection: { _id: 0 } }).toArray();
    let users = await usersCollection().find({}, { projection: { _id: 0 } }).toArray();

    let sanitized = [];
    for (let r of requests) {
        let user = users.find(u => u.email === r.userId);

        sanitized.push({
            id: r.id,
            type: r.type,
            subjectName: r.type === 'room' ? r.roomName : (user ? user.firstName + " " + user.lastName : 'Unknown'),
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

const server = createServer(app);

try {
    await connectDB();
} catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    console.error(`Make sure MongoDB is running and reachable (checked ${process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017'}).`);
    process.exit(1);
}

await attachChat(server, { findUserByEmail, findGroupById });

server.listen(port, async () => {
    console.log("running on " + port);

    const adminExists = (await usersCollection().findOne({ isSuperAdmin: true })) !== null;

    if (!adminExists) {
        const rl = readline.createInterface({input, output});
        console.log("Super Admin not detected... Creating one.");

        try {
            const firstName = await rl.question("First Name: ");
            const lastName = await rl.question("Last Name: ");
            const dob = await rl.question("DOB (YYYY-MM-DD): ");
            const email = await rl.question("Email: ");
            const password = await rl.question("Password: ");

            await usersCollection().insertOne({firstName, lastName, dob, email, password, isSuperAdmin: true});
            console.log("Super Admin created.");
        } finally {
            rl.close();
        }

    }
});
