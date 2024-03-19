import app from './app.js';
import connectWithDB from './src/config/db.js';

connectWithDB();

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at port : ${port}`);
});
