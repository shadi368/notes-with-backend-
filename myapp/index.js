const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');

const app = express();
const prisma = new PrismaClient();
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

app.use(bodyParser.json());

// POST /note/:id - Get a specific note by ID
app.post('/note/:id', async (req, res) => {
  const noteId = parseInt(req.params.id);
  const { userId } = req.body;

  try {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (note.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve note' });
  }
});

// POST /notes - List all notes by userId
app.post('/notes', async (req, res) => {
  const { userId } = req.body;

  try {
    const notes = await prisma.note.findMany({ where: { userId } });
    if (notes.length === 0) {
      return res.status(404).json({ error: 'No notes found' });
    }
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

// DELETE /note/:id - Delete a specific note by ID
app.delete('/note/:id', async (req, res) => {
  const noteId = parseInt(req.params.id);
  const { userId } = req.body;

  try {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (note.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.note.delete({ where: { id: noteId } });
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// GET /user/:id - Get user by ID
app.get('/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// POST /user/create - Create a new user
app.post('/user/create', async (req, res) => {
  const { username, email } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const user = await prisma.user.create({
      data: { username, email },
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
