const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const port = 5002;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const sql = require('mssql');

const config = {
    user: 'charan',
    password: 'Naidu@269', 
    server: 'tedbbyua.database.windows.net', 
    database: 'config',
    options: {
        encrypt: true, 
        enableArithAbort: true
    }
};
let pool;
async function connectToDatabase() {
    try {
       
        pool = await sql.connect(config);
        console.log('Connected to Azure SQL Database');
      
        let result = await pool.request().query('SELECT * FROM configuration');
        console.log(result);
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

connectToDatabase();

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try{
        const result = await pool.request()
            .input('username',sql.VarChar,username)
            .query('select * from information where [username] = @username');
            if(result.recordset.length == 0)
                return res.status(401).send('Invalid Credentials')
            const user = result.recordset[0];
                        
            if (user.password !== password) {
                return res.status(401).send('Invalid credentials');
            }
                
            const payload = { username: user.username ,email: user.email} 

            const token = jwt.sign(payload, 'd3b07384-d9a1-4c6a-9b5c-74a11e6b823f', { expiresIn: '8h' });
                
                        
            res.json({ token });
                
            } catch (error) {
                res.status(500).send(error.message);
            }
    });
    const authenticateToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);
      
        jwt.verify(token, 'd3b07384-d9a1-4c6a-9b5c-74a11e6b823f', (err, payload) => {
          if (err) return res.sendStatus(403);
          req.payload = payload;
          next();
        });
      };

    app.get('/protected', authenticateToken, (req, res) => {

        const username = req.payload.username;
        const email = req.payload.email;


        res.json(
            {user: username,useremail:email});
    });   

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM information WHERE [username] = @username');

        if (result.recordset.length > 0) {
            return res.status(400).send('This username is already registered');
        } else {
           
            
            const insertResult = await pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .input('email', sql.VarChar, email)
                .query('INSERT INTO information ([username], [email], [password]) VALUES (@username, @email, @password)');

           

            res.send({ message: 'User registered successfully', id: insertResult.recordset, username, email, password });
        }
    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/sub', async (req, res) => {
  try {
      const result = await pool.request().query('SELECT * FROM configuration');
      res.send(result.recordset);
  } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
  }
});
app.post('/sub', async (req, res) => {
  const { Key, Value } = req.body;
  try {
      const result = await pool.request()
          .input('Key', sql.VarChar, Key)
          .query('SELECT * FROM configuration WHERE [Key] = @Key');

      if (result.recordset.length > 0) {
          await pool.request()
              .input('Value', sql.VarChar, Value)
              .input('Key', sql.VarChar, Key)
              .query('UPDATE configuration SET [Value] = @Value WHERE [Key] = @Key');
          res.send({ message: 'Updated successfully', Key, Value });
      } else {
          const insertResult = await pool.request()
              .input('Key', sql.VarChar, Key)
              .input('Value', sql.VarChar, Value)
              .query('INSERT INTO configuration ([Key], [Value]) VALUES (@Key, @Value)');
          res.send({ message: 'Inserted successfully', id: insertResult.recordset, Key, Value });
      }
  } catch (err) {
      console.error('Error handling request:', err);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  const username = req.headers['x-user-name'];

  if (username !== 'Charan') {
      return res.status(401).json({ message: 'Authentication is not verified' });
  }

  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }

  try {
      const subscr = 'subscription key';
      const end = 'end point';
      const imageBuffer = req.file.buffer;

      const result = await pool.request()
          .input('subscr', sql.VarChar, subscr)
          .query('SELECT [Value] AS subscriptionKey FROM configuration WHERE [Key] = @subscr');
      if (result.recordset.length === 0) {
          return res.status(404).send('subscription key not found');
      }
      const resu = await pool.request()
                  .input('end',sql.VarChar,end)
                  .query('SELECT [Value] AS endpoint FROM configuration WHERE [Key] = @end');
      if (resu.recordset.length === 0){
          return res.status(404).send('endpoint is not found');
      }
      const endpoint = resu.recordset[0].endpoint;
      const subscription = result.recordset[0].subscriptionKey;
      const options = {
          headers: {
              'Content-Type': 'application/octet-stream',
              'Ocp-Apim-Subscription-Key': subscription,
          },
          params: {
              'language': 'unk',
              'detectOrientation': 'true',
          },
      };

      const response = await axios.post(endpoint, imageBuffer, options);
      const extractedText = response.data.regions.map(region =>
          region.lines.map(line =>
              line.words.map(word => word.text).join(' ')
          ).join('\n')
      ).join('\n');

      res.json({ text: extractedText });
  } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
