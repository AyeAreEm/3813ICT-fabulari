import { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import { getDB } from './db.js';

const MAX_HISTORY = 5;
const MAX_MESSAGE_LENGTH = 2000;

const roomKey = (groupId, roomId) => `${groupId}:${roomId}`;

function messagesCollection() {
    return getDB().collection('messages');
}

async function loadRecentHistory(key) {
    const docs = await messagesCollection()
        .find({ room: key }, { projection: { _id: 0, room: 0 } })
        .sort({ timestamp: -1 })
        .limit(MAX_HISTORY)
        .toArray();
    return docs.reverse();
}

async function pushMessage(key, message) {
    const collection = messagesCollection();
    await collection.insertOne({ room: key, ...message });

    const stale = await collection
        .find({ room: key }, { projection: { _id: 1 } })
        .sort({ timestamp: -1 })
        .skip(MAX_HISTORY)
        .toArray();

    if (stale.length > 0) {
        await collection.deleteMany({ _id: { $in: stale.map((d) => d._id) } });
    }
}

// roomKey -> Map<socketId, PresenceUser>
const presence = new Map();

function usersInRoom(key) {
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

export async function attachChat(httpServer, { findUserByEmail, findGroupById }) {
    const io = new Server(httpServer, {
        cors: { origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:4200' },
    });

    io.use(async (socket, next) => {
        const email = socket.handshake.auth?.email;
        const user = typeof email === 'string' ? await findUserByEmail(email) : null;
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
        socket.on('room:join', async (payload, ack) => {
            const reply = typeof ack === 'function' ? ack : () => {};
            try {
                const { groupId, roomId } = payload ?? {};
                if (typeof groupId !== 'string' || typeof roomId !== 'string') {
                    return reply({ ok: false, error: 'Room not found.' });
                }

                const group = await findGroupById(groupId);
                if (!group || !(group.rooms ?? []).some((r) => r.id === roomId)) {
                    return reply({ ok: false, error: 'Room not found.' });
                }

                const member = group.members.find((m) => m.id === socket.data.user.id);
                if (!member) return reply({ ok: false, error: 'You are not a member of this group.' });

                const key = roomKey(groupId, roomId);
                if (socket.data.room?.key !== key) {
                    leaveCurrentRoom(socket);

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

                reply({ ok: true, history: await loadRecentHistory(key), users: usersInRoom(key) });
            } catch (err) {
                console.error('room:join failed:', err);
                reply({ ok: false, error: 'Could not join room.' });
            }
        });

        socket.on('room:leave', () => leaveCurrentRoom(socket));

        socket.on('message:send', async (payload, ack) => {
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
                timestamp: new Date().toISOString(),
                text,
            };

            try {
                await pushMessage(room.key, message);
            } catch (err) {
                console.error('failed to save message:', err);
                return reply({ ok: false, error: 'Could not send message.' });
            }

            io.to(room.key).emit('message:new', message);
            reply({ ok: true });
        });

        socket.on('disconnect', () => leaveCurrentRoom(socket));
    });

    return io;
}
