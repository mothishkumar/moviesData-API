const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbobject = (dbobject) => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  };
};

const convertDbobjecttable = (dbobject) => {
  return {
    directorId: dbobject.director_id,
    directorName: dbobject.director_name,
  };
};

const convertmoviename = (dbobject) => {
  return {
    movieName: dbobject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getmoviequery = `
    select movie_name
     from movie;
    `;
  const movie = await db.all(getmoviequery);
  response.send(movie.map((eachmovie) => convertDbobject(eachmovie)));
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmoviequery = `
        select *
        from movie
        where movie_id=${movieId};
    `;
  const movie = await db.get(getmoviequery);
  response.send(convertDbobject(movie));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
    INSERT INTO movie
    (director_id, movie_name, lead_actor)
    VALUES
    (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );
    `;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = ` 
        update
         movie
        set 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
        where
         movie_id=${movieId};
    `;
  await db.run(addMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemoviequery = `
        delete from movie
        where movie_id=${movieId};
        `;
  await db.run(deletemoviequery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getmoviequery = `
    select *
     from director;
    `;
  const director = await db.all(getmoviequery);
  response.send(director.map((eachmovie) => convertDbobjecttable(eachmovie)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getdirectormoviequery = `
        select movie_name
        from director inner join movie
        on director.director_id=movie.director_id
        where director.director_id=${directorId};
    `;
  const movie = await db.all(getdirectormoviequery);
  response.send(movie.map((eachmovie) => convertmoviename(eachmovie)));
});

module.exports = app;
