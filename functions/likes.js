const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

const DB_PATH = path.join(__dirname, 'likes.json');

async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return { likes: [] };
  }
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

exports.handler = async (event) => {
  const method = event.httpMethod;
  const headers = { 'Content-Type': 'application/json' };
  const parseCookies = (str) => Object.fromEntries(str.split(';').map(c => c.trim().split('=').map(decodeURIComponent)).filter(p => p[0]));
  const serializeCookie = (name, val, opts = {}) => {
    const pairs = [`${name}=${encodeURIComponent(val)}`];
    if (opts.maxAge) pairs.push(`Max-Age=${opts.maxAge}`);
    if (opts.path) pairs.push(`Path=${opts.path}`);
    if (opts.httpOnly) pairs.push('HttpOnly');
    return pairs.join('; ');
  };

  const cookies = parseCookies(event.headers.cookie || '');
  let uid = cookies.uid;
  if (!uid) {
    uid = randomUUID();
    headers['Set-Cookie'] = serializeCookie('uid', uid, { path: '/', httpOnly: true, maxAge: 31536000 });
  }

  const db = await readDb();

  if (method === 'GET') {
    const idsParam = event.queryStringParameters && event.queryStringParameters.ids || '';
    const ids = idsParam.split(',').filter(Boolean);
    const counts = {};
    const liked = [];
    ids.forEach(id => counts[id] = 0);
    for (const like of db.likes) {
      if (ids.includes(like.imageId)) {
        counts[like.imageId] = (counts[like.imageId] || 0) + 1;
        if (like.user === uid) liked.push(like.imageId);
      }
    }
    return { statusCode: 200, headers, body: JSON.stringify({ counts, liked }) };
  }

  if (method === 'POST') {
    const { imageId } = JSON.parse(event.body || '{}');
    if (!imageId) return { statusCode: 400, headers, body: '{"error":"imageId required"}' };
    const exists = db.likes.find(l => l.imageId === imageId && l.user === uid);
    if (!exists) db.likes.push({ imageId, user: uid, ts: Date.now() });
    await writeDb(db);
    return { statusCode: 200, headers, body: '{}' };
  }

  if (method === 'DELETE') {
    const { imageId } = JSON.parse(event.body || '{}');
    if (!imageId) return { statusCode: 400, headers, body: '{"error":"imageId required"}' };
    db.likes = db.likes.filter(l => !(l.imageId === imageId && l.user === uid));
    await writeDb(db);
    return { statusCode: 200, headers, body: '{}' };
  }

  return { statusCode: 405, headers, body: '{"error":"Method not allowed"}' };
};
