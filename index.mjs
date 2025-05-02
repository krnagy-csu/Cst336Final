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
database: "krnagysi_MovieDB"
})




let API_KEY = '8e45b8b65e45477be92c88c380ddd965';

app.get('/', (req, res) => {
  res.render('home.ejs')
});

//routes
app.get('/searchMovie', (req, res) => {
   res.render('login.ejs')
});

app.post('/search', async(req, res) => {
  let searchBar = req.body.searchBar;
    
    let response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchBar)}`);
    let data = await response.json();
    let movies = data.results;

    res.render('search.ejs', { movies });
 });


 app.get('/movie/:id', async (req, res) => {
  let movieId = req.params.id;

  let response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
  let movie = await response.json();

  let response2 = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`);
  let data2 = await response2.json();
  let cast = data2.cast;
  let crew = data2.crew;
  let director = crew.find(person => person.job === "Director");

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



  res.render('overview.ejs', { movie, cast, trailer, director, recommendations, reviews});
  
});

app.get('/trending', async(req, res) => {
  let response =  await fetch (`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`)
  let data = await response.json();
  let trending = data.results;
  console.log(trending)
  res.render('trendingMovies.ejs' , {trending})
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
  res.render('filmQuiz.ejs' , {quizData})

});

app.post('/filmQuiz', async(req, res) => {
  let score = 0;
  let total = 0;

 
  for (let i = 0; req.body[`question${i}`]; i++) {
    let userAnswer = req.body[`question${i}`];
    let correctAnswer = req.body[`correct${i}`];

    total++;

    if (userAnswer === correctAnswer) {
      score++;
    }
  }

  res.render('quizResults.ejs', {score, total})

});

/*app.get('/dbTest', async (req,res) =>{
  
})*/


app.listen(3000, () => {
   console.log('server started');
});