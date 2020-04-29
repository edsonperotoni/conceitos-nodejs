const express = require("express");
const cors = require("cors");
const { uuid,isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next){
  const {method, url} = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

function validateRepositorieId(request,response,next){
    const {id} = request.params;
    if(!isUuid(id)){
      return response.status(400).json({error:"Invalid uuid"})
    }
    const repositorieIndex = repositories.findIndex(repository => repository.id == id);
    if(repositorieIndex<0){
      return response.status(400).json({error:"repository not found"})
    }
    next();
}

app.use(logRequests);
app.use('/repositories/:id', validateRepositorieId);

app.get("/repositories", (request, response) => {
  return response.status(200).json(
    repositories 
  );
});

app.post("/repositories", (request, response) => {
  const {url,title,techs} = request.body;
  const repository = {id:uuid(),title,url,techs,likes:0};
  repositories.push(repository);
  return response.status(200).json(
    repositories[repositories.length-1]
  );
});

app.put("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const {title,url,techs} = request.body;
  const repositorieIndex = repositories.findIndex(repository=>repository.id === id);
  
  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositorieIndex].likes 
  }

  repositories[repositorieIndex] =  repository;
  
  return response.json(
    repositories[repositorieIndex]
  );
});

app.delete("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const repositorieIndex = repositories.findIndex(repository=>repository.id === id);
  
  repositories.splice(repositorieIndex,1);

  return  response.status(200).json(
    {
      id,
      message:"repository deleted"
    }
  );
});

app.post("/repositories/:id/like", (request, response) => {
  const {id} = request.params;
  const repositorieIndex = repositories.findIndex(repository=>repository.id === id);
  repositories[repositorieIndex].likes +=1;
  return response.json(
    repositories[repositorieIndex]
  );
});

module.exports = app;
