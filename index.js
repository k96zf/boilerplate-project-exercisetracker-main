const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let users = [];
let exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post("/api/users",(req,res)=>{
  const user = {
    username:req.body.username,
    _id:Date.now().toString()
  };
  users.push(user);
  res.json(user);
});

app.get("/api/users",(req,res)=>{
  res.json(users);
})

app.post("/api/users/:_id/exercises",(req,res)=>{
  const user = users.find(u => u._id === req.params._id);
  if(!user) return res.json({error:"User Not Found"});

  const date = req.body.date ? new Date(req.body.date) : new Date();

  const exercise = {
    userId:user._id,
    description:req.body.description,
    duration:parseInt(req.body.duration),
    date
  };
  exercises.push(exercise);

  res.json({
    _id:user._id,
    username:user.username,
    description:exercise.description,
    duration:exercise.duration,
    date:exercise.date.toDateString(),
  })
});

app.get("/api/users/:_id/logs",(req,res)=>{
  const {from,to,limit} = req.query;
  const user = users.find(u=>u._id===req.params._id);
  if(!user) return res.json({error:"User Not Found"});
  let userExercises = exercises.filter(e=> e.userId === user._id);

  if(from){
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => e.date >= fromDate);
  }
  if(to){
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => e.date <= toDate);
  }
  if(limit){
    userExercises = userExercises.slice(0,parseInt(limit));
  }
  res.json({
    _id:user._id,
    username:user.username,
    count:userExercises.length,
    log: userExercises.map(e=>({
      description:e.description,
      duration:e.duration,
      date:e.date.toDateString()
    })),
  })
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
