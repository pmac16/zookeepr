const fs = require('fs');
const path = require('path');
const express = require('express');
const { animals } = require('./data/animals');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    //Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        //save personalityTraits as a dedicated array/
        //if personalityTraits is a string, place it into a new array and save.
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
    //Loop through each trait in teh personalityTraits array;
    personalityTraitsArray.forEach(trait => {
        //check the trait against each animal in teh filteredResults array.
        //Remeber, it is initally a copy of the animalsArray.
        //but here we're updating it for each trait in the .forEach() loop.
        //For each trait being targeted by the filter, the filteredResults 
        //array will then contain only the entries that contain the trait,
        //so at the end we'll have an array of animals that have every one 
        //of the traits when the .forEach() loop is finished.
        filteredResults = filteredResults.filter(
            animal => animal.personalityTraits.indexOf(trait) !== -1
          //filter is the method 
          //animal is a representation of whatever is at a particluar index in the array

        );
    });
        
    }
    if (query.diet) {
      filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
      filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
      filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
  }

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

function createNewAnimal(body, animalsArray) {
  //our function's main code will go heree!
  const animal = body;
  animalsArray.push(animal)
  //return finished code to post route for response
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    JSON.stringify({animals: animalsArray}, null, 2)
  );
  return animal;
}

function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });

  //param route must come after the other GET route
  app.get('/api/animals/:id', (req, res) => {
      const result = findById(req.params.id, animals);
      if (result) {
        res.json(result);
      } else {
          //send an error message 
          res.send(404);
      }
      
  });

  app.post('/api/animals', (req, res) => {
    //req.body is where our incoming content will be
    //set id based on what the next index of the array will be 
    req.body.id = animals.length.toString();

    //if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
      res.status(400).send('The animal is not properly formatted. ')
    } else {
       //add animal to json file and animals array in this function
      const animal = createNewAnimal(req.body, animals);
      res.json(animal);
    }
    
   
  
  });



  
//you can put app.listen() at the end but it is not required
app.listen(PORT, () => {
    console.log(`API server now on port 3001!`);
})