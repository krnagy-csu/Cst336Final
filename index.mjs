import express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';
import fetch from 'node-fetch';
import he from 'he';
import mysql from 'mysql2/promise';



const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));


//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//session configuration
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'cst336 csumb',
  resave: false,
  saveUninitialized: true
}))

//Database stuff - Krisztian

const pool = mysql.createPool({
host:"krnagy.site",
user: "krnagysi_Admin",
password: "1#67Mm.L}SC#",
database: "krnagysi_MovieDB",
connectionLimit : 10,
waitForConnections: true
})

const conn = await pool.getConnection();


let API_KEY = '8e45b8b65e45477be92c88c380ddd965';

app.get('/', (req, res) => {
  let thisSession = req.session;
  res.render('signInPage.ejs',{thisSession})
});

app.get('/home', async (req, res) => {
  if (req.session == null){
    res.redirect('/signIn');
  } else {
  let thisSession = req.session;
  let sql = `SELECT *
  FROM User
  WHERE UserID = ?`;
  const [rows] = await conn.query(sql, thisSession.userID); 
  let sql2 = `SELECT *
  FROM Reviews
  WHERE UserID = ?`;
  const [reviews] = await conn.query(sql2, thisSession.userID); 

  res.render('home.ejs',{thisSession, rows, reviews})
  }
});

//routes
app.get('/searchMovie', (req, res) => {
  let thisSession = req.session;
   res.render('login.ejs', {thisSession})
});

app.post('/search', async(req, res) => {
  let searchBar = req.body.searchBar;
    
    let response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchBar)}`);
    let data = await response.json();
    let movies = data.results;
    let thisSession = req.session;
    res.render('search.ejs', { movies , thisSession});
 });


 app.get('/movie/:id', async (req, res) => {
  let movieId = req.params.id;

  let response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
  let movie = await response.json();
  let movieName = movie.title;
  let year = movie.release_date.split('-')[0];

  let response2 = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`);
  let data2 = await response2.json();
  let cast = data2.cast;
  let crew = data2.crew;
  let director = crew.find(person => person.job === "Director");
  let directorName = director.name;

  let response3 = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`);
  let data3 = await response3.json();
  let videos = data3.results;

  let trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');

  let response4 = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${API_KEY}`);
  let data4 = await response4.json();
  let recommendations = data4.results;

  let response5 = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${API_KEY}`);
  let data5 = await response5.json();
  let reviews = data5.results;

  let sql = `SELECT r.*, u.Username
             FROM Reviews r
             INNER JOIN User u on r.UserID = u.UserID
             WHERE r.MovieName = ? AND r.MovieYear = ? AND r.Director = ?`;
  const [userReviews] = await conn.query(sql, [movieName, year, directorName]); 
  const [avgReviews] = await conn.query(`SELECT Rating FROM Reviews WHERE MovieName = ? AND MovieYear = ? AND Director = ?`, [movieName, year, directorName]);
  let avg = 0;
  for (let rating of avgReviews){
    avg += rating.Rating;
  }
  avg = (avg / avgReviews.length);
  
  let thisSession = req.session;
  res.render('overview.ejs', { movie, cast, trailer, director, recommendations, reviews, userReviews, avg, thisSession, movieId});
  
});

app.get('/trending', async(req, res) => {
  let response =  await fetch (`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`)
  let data = await response.json();
  let trending = data.results;
  console.log(trending)
  let thisSession = req.session;
  res.render('trendingMovies.ejs' , {trending, thisSession})
});

app.get('/filmQuiz', async(req, res) => {
  let response =  await fetch (`https://opentdb.com/api.php?amount=10&category=11`)
  let data = await response.json();
  

  let quizData = [];

if (data && Array.isArray(data.results)) {
for (let i = 0; i < data.results.length; i++) {
  let q = data.results[i];
  quizData.push({
    question: he.decode(q.question),
    correct_answer: he.decode(q.correct_answer),
    incorrect_answers: q.incorrect_answers.map(ans => he.decode(ans))
  });
}
}
  console.log(quizData)
  let thisSession = req.session;
  res.render('filmQuiz.ejs' , {quizData,thisSession})
});

app.post('/filmQuiz', async(req, res) => {
  let score = 0;
  let total = 0;
  console.log(req.session);
 
  for (let i = 0; req.body[`question${i}`]; i++) {
    let userAnswer = req.body[`question${i}`];
    let correctAnswer = req.body[`correct${i}`];

    total++;

    if (userAnswer === correctAnswer) {
      score++;
    }
  }
  let sql = `SELECT TeamID FROM User WHERE UserId = ` + req.session.userID;
  console.log(req.session.userID);
  let [rows] = await conn.query(sql);
  let teamID = rows[0].TeamID;
  let sql2 = `UPDATE Teams SET Score = Score + ` + score + ` WHERE TeamID = ` + teamID;
  console.log(sql2);
  await conn.query(sql2);
  let sql3 = `SELECT * FROM Teams WHERE TeamID = ` + teamID;
  let [rows2] = await conn.query(sql3);
  let team = rows2[0];
  console.log(rows2)
  //console.log("Team score: " + team.Score);
  let thisSession = req.session;
  res.render('quizResults.ejs', {score, total, team, thisSession})
});

app.get('/signIn', (req,res) =>{
  let thisSession = req.session;
  res.render('signInPage.ejs',{thisSession});
})

app.get('/signUp', (req, res) =>{
  let thisSession = req.session;
  res.render('signUpPage.ejs',{thisSession});
})

app.get('/logout', (req, res) => {
  req.session.destroy();
  let thisSession = {
    "UserID" : undefined,
    "Username" : undefined,
    "Password" : undefined
  };
  res.render('signInPage.ejs',{thisSession});
});

app.get('/teams', async (req,res) =>{
  let sql = `SELECT * FROM Teams ORDER BY Score desc`;
  const [rows] = await conn.query(sql);
  let thisSession = req.session;
  res.render('teamPage.ejs', {rows,thisSession});
})

app.post('/updateUser', async(req,res) => {
  let username = req.body.Username;
  let password = req.body.Password;
  let userId = req.body.UserId;

  let sql = `UPDATE User
              SET Username = ?,
              password = ?
              WHERE UserID = ?`;
  let sqlParams = [username, password,userId];
  const [userInfo] = await conn.query(sql, sqlParams);
  res.redirect('/');
});

app.post('/signIn', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  

  let sql = `SELECT *
              FROM User
              WHERE Username = ?`;
    const [rows] = await conn.query(sql, [username]); 
    //console.log(username);
    //console.log(rows);
    
    let thisSession = req.session;

  if(rows.length > 0){
    if(password === rows[0].Password){
      let userId = rows[0].UserID;
      let sql2 = `SELECT *
                  FROM Reviews
                  WHERE UserID = ?`;
      const [reviews] = await conn.query(sql2, [userId]); 
     req.session.userAuthenticated = true;
     req.session.username = username;
     req.session.userID = rows[0].UserID;
     req.session.TeamID = rows[0].TeamID;
     //console.log(req.session.username);
     //console.log(req.session.userID);
     
     res.render('home.ejs',{rows, reviews,thisSession});
    }else{
      console.log("Error: password " + password + " != " + rows[0].Password);
      res.render('signInPage.ejs',{"error":"Wrong credentials!",thisSession});
    }
  }
});

app.get('/joinTeam', async (req,res) =>{
  let teamID = req.query.teamId;
  //console.log(req.query.teamId);
  //console.log(req.session.username);
  //console.log(req.session.userID);
  let sql = `UPDATE User SET TeamID = ` + teamID + ` WHERE UserID = ` + req.session.userID + `;`;
  let sqlParams = [`%${teamID}%`];
  await conn.query(sql,sqlParams);
  let users = conn.query(`SELECT * From Teams`);
  req.session.TeamID = teamID;
  let thisSession = req.session;
  res.redirect('/teams');
})

app.post('/submitReview', async (req,res) =>{
  let thisSession = req.session;
  let Rating = req.body.rating;
  let Review = req.body.movieReview;
  let UserID = req.body.userID;
  let Timestamp = new Date().toISOString();
  let movieName = req.body.movieName;
  let movieYear = req.body.year;
  let director = req.body.dir;
  let sqlParams = [Rating,Review,UserID,Timestamp,movieName,movieYear,director]
  let sql = `INSERT INTO Reviews (Rating, Review, UserID, Timestamp, MovieName, MovieYear, Director)
            VALUES (?,?,?,?,?,?,?);`
  let result = await conn.query(sql,[Rating,Review,UserID,Timestamp,movieName,movieYear,director]);
  console.log(result)
  res.redirect('/movie/'+req.body.movieID)
})

app.post('/createAcct', async (req,res) =>{
  let thisSession = req.session;
  const [rows] = await conn.query(`SELECT Username FROM User`)
  let usernameTaken = false;
  for (let row of rows){
    if (row.Username == req.body.username){
      usernameTaken = true;
    }
  }
  console.log(usernameTaken);
  if (usernameTaken){
    res.render('signUpPage.ejs',{thisSession,"error":"Username taken!"});
  } else{
    let sql = `INSERT INTO User (Username, Password, Admin, TeamID)
    VALUES (?,?,0,0);`;
    let params = [req.body.username, req.body.password];
    await conn.query(sql,params);
    res.redirect('/')
  }
})

function isAuthenticated(req, res, next){
  if(req.session.userAuthenticated){
     next();
  }else{
     res.redirect("/");
  }
}


app.listen(3000, () => {
   console.log('server started');
});