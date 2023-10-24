const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const users = [];
const exercises = [];

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = {
    _id: users.length.toString(),
    username,
  };
  users.push(newUser);
  exercises.push([]);
  res.json(newUser);
});

app.post('/api/users/:id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const _id = req.params.id;
  const user = users.find((user) => user._id === _id);
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  const exercise = { description, duration: Number(duration), date: new Date(date) };
  exercises[_id].unshift(exercise);
  res.json({
    _id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const { from, to, limit } = req.query;
  const user = users.find((user) => user._id === _id);
  let logs = exercises[_id];

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  if (from) {
    logs = logs.filter((exercise) => exercise.date >= new Date(from));
  }

  if (to) {
    logs = logs.filter((exercise) => exercise.date <= new Date(to));
  }

  if (limit) {
    logs = logs.slice(0, limit);
  }

  logs = logs.map((exercise) => ({
    ...exercise,
    date: exercise.date.toDateString(),
  }));

  res.json({
    _id,
    username: user.username,
    count: logs.length,
    log: logs,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
