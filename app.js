const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = (__dirname, "moviesData.db");

let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`dataBase error: ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// API 1 getting all movies names
app.get("/movies/", async (request, response) => {
  const movies = `SELECT movie_name FROM  movie`;

  const moviesList = await db.all(movies);

  response.send(
    moviesList.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//Add newMovie

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovie = `
    INSERT INTO 
        movie(director_id,movie_name,lead_actor) 
    VALUES ('${directorId}','${movieName}', '${leadActor}')`;

  const dbResponse = await db.run(addMovie);

  response.send("Movie Successfully Added");
});

//get movie based on MovieId

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovie = `
    SELECT 
        *
    FROM
        movie
    WHERE
        movie_id = ${movieId};`;

  const movieD = await db.get(getMovie);

  response.send(convertDbObjectToResponseObject(movieD));
});

//Update Movie

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
    UPDATE movie
    SET 
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        WHERE 
            movie_id = ${movieId};`;

  await db.run(updateMovie);

  response.send("Movie Details Updated");
});

//Delete Movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM 
        movie 
    WHERE 
        movie_id = ${movieId}`;

  await db.run(deleteMovie);

  response.send("Movie Removed");
});

//All Directors

app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT * 
    FROM director`;

  const directorsList = await db.all(getDirectors);

  response.send(
    directorsList.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

//Director Movies

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMovie = `
    SELECT
        movie_name
    FROM
        movie
    WHERE
        director_id = ${directorId}`;

  const directorList = await db.all(getDirectorMovie);

  response.send(
    directorList.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
