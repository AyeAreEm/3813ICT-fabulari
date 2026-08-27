import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const app = express();
const port = 3000;

async function loadUsers() {
    try {
        const data = await readFile('./users.json', 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}
async function saveUsers(users) {
    await writeFile('./users.json', JSON.stringify(users, null, 2), 'utf-8');
}

async function loadCreateGroupRequests() {
    try {
        const data = await readFile('./create-group-requests.json', 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}
async function saveCreateGroupRequests(requests) {
    await writeFile('./create-group-requests.json', JSON.stringify(requests, null, 2), 'utf-8');
}

async function loadGroups() {
    try {
        const data = await readFile('./groups.json', 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}
async function saveGroups(groups) {
    await writeFile('./groups.json', JSON.stringify(groups, null, 2), 'utf-8');
}

async function loadGroupRequests() {
    try {
        const data = await readFile('./group-requests.json', 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}
async function saveGroupRequests(requests) {
    await writeFile('./group-requests.json', JSON.stringify(requests, null, 2), 'utf-8');
}

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post('/auth/signup', async (req, res) => {
    const { firstname, lastname, dob, email, password } = req.body;
    const users = await loadusers();

    for (let user of users) {
        if (user.email === email) {
            res.status(400).json({status: "email already in use."});
            return;
        }
    }

    const newuser = {firstname, lastname, dob, email, password, issuperadmin: false};
    users.push(newuser);
    await saveUsers(users);
    res.json(newUser);
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const users = await loadUsers();

    for (let user of users) {
        if (user.email === email && user.password === password) {
            const { password: pw, ...safeUser } = user;
            res.json(safeUser);
            return;
        }
    }

    res.status(400).json({status: "Invalid credentials."});
});

app.post('/create-group-requests', async (req, res) => {
    console.log(req.body);
    let createGroupRequests = await loadCreateGroupRequests();
    createGroupRequests.push(req.body);
    await saveCreateGroupRequests(createGroupRequests);
});

app.get('/create-group-requests', async (req, res) => {
    let createGroupRequests = await loadCreateGroupRequests();
    res.json(createGroupRequests);
});

app.patch('/create-group-requests/:id', async (req, res) => {
    let requests = await loadCreateGroupRequests();

    if (req.body.create) {
        let groups = await loadGroups();
        let users = await loadUsers();
        let user = users.find(u => u.email === r.requesterId);

        for (let r of requests) {
            if (r.id == req.params.id) {
                groups.push({
                    id: crypto.randomUUID(),
                    admin: r.requesterName,
                    adminId: r.requesterId,
                    name: r.proposedTitle,
                    description: r.description,
                    members: [{
                        id: r.requesterId,
                        name: user.firstName + " " + user.lastName,
                        initials: user.firstName[0] + user.lastName[0],
                        role: 'Admin',
                    }],
                });
            }
        }
        await saveGroups(groups);
    }

    requests = requests.filter(r => r.id !== req.params.id);
    await saveCreateGroupRequests(requests);

    res.status(200);
});

app.get('/groups', async (req, res) => {
    let groups = await loadGroups();

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
    let groups = await loadGroups();
    let g = groups.find(group => group.id === req.params.id);
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
    let jreqs = await loadGroupRequests();
    jreqs.push({
        id: crypto.randomUUID(),
        type: 'join',
        groupId: req.params.id,
        userId: req.body.userId,
        message: req.body.message,
        date: Date.now(),
    });
    await saveGroupRequests(jreqs);

    res.status(200);
});

app.patch('/groups/:gid/requests/:rid', async (req, res) => {
    let requests = await loadGroupRequests();
    let request = requests.find(r => r.id === req.params.rid);

    if (request.type === 'join') {
        if (req.body.approve) {
            let groups = await loadGroups();
            let users = await loadUsers();
            let user = users.find(u => u.email === r.requesterId);

            for (let g of groups) {
                if (g.id === req.params.gid) {
                    g.members.push({
                        id: request.userId,
                        name: user.firstName + " " + user.lastName,
                        initials: user.firstName[0] + user.lastName[0],
                        role: 'Member',
                    });
                }
            }
            await saveGroups(groups);
        }

        requests = requests.filter(r => r.id !== req.params.rid);
        await saveGroupRequests(requests);
        return;
    }
});

app.get('/groups/:id/requests', async (req, res) => {
    let allRequests = await loadGroupRequests();
    let requests = allRequests.filter(r => r.id !== req.params.id);
    let users = await loadUsers();

    let sanitized = [];
    for (let r of requests) {
        let user = users.find(u => u.email === r.userId);

        sanitized.push({
            id: r.id,
            type: r.type,
            subjectName: user.firstName + " " + user.lastName,
            message: r.message,
            date: r.date,
        });
    }

    res.json(sanitized);
});

app.get('/groups/:id/members', async (req, res) => {
    let groups = await loadGroups();
    let group = groups.find(g => g.id === req.params.id);
    res.json(group.members);
});

app.get('/profile/:id/groups', async (req, res) => {
    let groups = await loadGroups();
    let theirs = groups.filter(g => {
        for (let member of g.members) {
            if (member.id === req.params.id)  {
                return true;
            }
        }
        return false;
    });

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

app.listen(port, async () => {
    console.log("running on " + port);

    const users = await loadUsers();
    const adminExists = users.some(u => u.isSuperAdmin);

    if (!adminExists) {
        const rl = readline.createInterface({input, output});
        console.log("Super Admin not detected... Creating one.");

        try {
            const firstName = await rl.question("First Name: ");
            const lastName = await rl.question("Last Name: ");
            const dob = await rl.question("DOB (YYYY-MM-DD): ");
            const email = await rl.question("Email: ");
            const password = await rl.question("Password: ");

            users.push({firstName, lastName, dob, email, password, isSuperAdmin: true});
            await saveUsers(users);
            console.log("Super Admin created.");
        } finally {
            rl.close();
        }

    }
});
