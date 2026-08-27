import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';

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

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post('/auth/signup', async (req, res) => {
    const { firstName, lastName, dob, email, password } = req.body;
    const users = await loadUsers();

    for (let user of users) {
        if (user.email === email) {
            res.status(400).json({status: "Email already in use."});
            return;
        }
    }

    const newUser = {firstName, lastName, dob, email, password, isSuperAdmin: false};
    users.push(newUser);
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
    let createGroupRequests = await loadCreateGroupRequests();
    createGroupRequests.push(req.body);
    await saveCreateGroupRequests(createGroupRequests);
});

app.get('/create-group-requests', async (req, res) => {
    let createGroupRequests = await loadCreateGroupRequests();
    res.json(createGroupRequests);
});

app.listen(port, async () => {
    console.log("running on " + port);

    const users = await loadUsers();
    const adminExists = users.some(u => u.email === "super@admin.com");
    if (!adminExists) {
        users.push({firstName: "Super", lastName: "Admin", dob: '1977-01-01', email: "super@admin.com", password: "Superadmin", isSuperAdmin: true});
        await saveUsers(users);
        console.log("Super Admin created: super@admin.com, Superadmin");
    }
});
