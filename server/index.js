import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('RAYKELS API RUNNING');
  console.log(`http://localhost:${PORT}`);
  console.log('');
});
