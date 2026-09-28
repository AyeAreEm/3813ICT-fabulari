import { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'fs/promises';

const MESSAGES_FILE = './messages.json';
const MAX_HISTORY = 5;           // (R14) new joiners see the last 5 messages
const MAX_MESSAGE_LENGTH = 2000;

// Rooms aren't stored on the server yet (the client uses a single "general" room),
// so this is the list of valid room ids. Replace with a real lookup once rooms are persisted.
const KNOWN_ROOMS = new Set(['general']);

const roomKey = (groupId, roomId) => `${groupId}:${roomId}`;

// ---------------------------------------------------------------------------
// Message history: ring buffer of the last MAX_HISTORY messages per room (R14)
// ---------------------------------------------------------------------------
let history = {}; // roomKey -> Message[]

async function loadHistory() {
    try {
        history = JSON.parse(await readFile(MESSAGES_FILE, 'utf-8'));
    } catch {
        history = {};
    }
}

// Serialise writes so two messages arriving together can't interleave file writes.
let writeChain = Promise.resolve();
function persistHistory() {
    const snapshot = JSON.stringify(history, null, 2);
    writeChain = writeChain
        .then(() => writeFile(MESSAGES_FILE, snapshot, 'utf-8'))
        .catch((err) => console.error('failed to save messages:', err));
}

function pushMessage(key, message) {
    const buffer = history[key] ?? (history[key] = []);
    buffer.push(message);
    if (buffer.length > MAX_HISTORY) buffer.shift();
    persistHistory();
}

// ---------------------------------------------------------------------------
// Presence: who is currently in each room. In-memory only (R22)
// ---------------------------------------------------------------------------
const presence = new Map(); // roomKey -> Map<socketId, PresenceUser>

function usersInRoom(key) {
    // One entry per user, even if they have several tabs open.
    const unique = new Map();
    for (const user of presence.get(key)?.values() ?? []) unique.set(user.id, user);
    return [...unique.values()];
}

function userHasOtherSocketInRoom(key, userId, exceptSocketId) {
    for (const [socketId, user] of presence.get(key) ?? []) {
        if (socketId !== exceptSocketId && user.id === userId) return true;
    }
    return false;
}

// ---------------------------------------------------------------------------
// Socket.IO server
// ---------------------------------------------------------------------------
export async function attachChat(httpServer, { loadUsers, loadGroups }) {
    await loadHistory();

    const io = new Server(httpServer, {
        cors: { origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:4200' },
    });

    // The REST API has no sessions or tokens yet, so the client identifies itself by email.
    // We only trust that email to look the user up: the display name, initials and role
    // always come from the server's own data, never from the client.
    io.use(async (socket, next) => {
        const email = socket.handshake.auth?.email;
        const users = await loadUsers();
        const user = typeof email === 'string' && users.find((u) => u.email === email);
        if (!user) return next(new Error('unauthorized'));

        socket.data.user = {
            id: user.email,
            name: `${user.firstName} ${user.lastName}`,
            initials: `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase(),
        };
        next();
    });

    function leaveCurrentRoom(socket) {
        const room = socket.data.room;
        if (!room) return;

        const { key } = room;
        const user = socket.data.user;
        socket.leave(key);
        socket.data.room = null;

        presence.get(key)?.delete(socket.id);
        if (presence.get(key)?.size === 0) presence.delete(key);

        // Only announce when their last tab leaves (R15)
        if (!userHasOtherSocketInRoom(key, user.id, socket.id)) {
            io.to(key).emit('room:userLeft', {
                id: randomUUID(),
                kind: 'left',
                userId: user.id,
                name: user.name,
                timestamp: new Date().toISOString(),
            });
        }
        io.to(key).emit('room:presence', usersInRoom(key));
    }

    io.on('connection', (socket) => {
        // -- join a room ------------------------------------------------------
        socket.on('room:join', async (payload, ack) => {
            const reply = typeof ack === 'function' ? ack : () => {};
            try {
                const { groupId, roomId } = payload ?? {};
                if (typeof groupId !== 'string' || typeof roomId !== 'string' || !KNOWN_ROOMS.has(roomId)) {
                    return reply({ ok: false, error: 'Room not found.' });
                }

                const groups = await loadGroups();
                const group = groups.find((g) => g.id === groupId);
                const member = group?.members.find((m) => m.id === socket.data.user.id);
                if (!member) return reply({ ok: false, error: 'You are not a member of this group.' });

                const key = roomKey(groupId, roomId);
                if (socket.data.room?.key !== key) {
                    leaveCurrentRoom(socket); // a socket is only ever in one room

                    const alreadyHere = userHasOtherSocketInRoom(key, socket.data.user.id, socket.id);
                    socket.join(key);
                    socket.data.room = { key, groupId, roomId };
                    if (!presence.has(key)) presence.set(key, new Map());
                    presence.get(key).set(socket.id, { ...socket.data.user, role: member.role });

                    if (!alreadyHere) {
                        socket.to(key).emit('room:userJoined', {
                            id: randomUUID(),
                            kind: 'joined',
                            userId: socket.data.user.id,
                            name: socket.data.user.name,
                            timestamp: new Date().toISOString(),
                        });
                    }
                    io.to(key).emit('room:presence', usersInRoom(key));
                }

                reply({ ok: true, history: history[key] ?? [], users: usersInRoom(key) });
            } catch (err) {
                console.error('room:join failed:', err);
                reply({ ok: false, error: 'Could not join room.' });
            }
        });

        // -- leave a room -----------------------------------------------------
        socket.on('room:leave', () => leaveCurrentRoom(socket));

        // -- send a message ---------------------------------------------------
        socket.on('message:send', (payload, ack) => {
            const reply = typeof ack === 'function' ? ack : () => {};
            const room = socket.data.room;
            if (!room) return reply({ ok: false, error: 'Join a room before sending messages.' });

            const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
            if (!text) return reply({ ok: false, error: 'Message is empty.' });
            if (text.length > MAX_MESSAGE_LENGTH) {
                return reply({ ok: false, error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
            }

            const { id: authorId, name: authorName, initials } = socket.data.user;
            const message = {
                id: randomUUID(),
                authorId,
                authorName,
                initials,
                timestamp: new Date().toISOString(), // stored in UTC (R19); client localises it
                text,
            };

            pushMessage(room.key, message);
            // Broadcast to everyone in the room *including the sender*, so every client
            // renders the same server-ordered stream.
            io.to(room.key).emit('message:new', message);
            reply({ ok: true });
        });

        socket.on('disconnect', () => leaveCurrentRoom(socket));
    });

    return io;
}
