import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => (
  <Link className="movie-card" to={`/movies/${movie._id}`}>
    <img src={movie.poster} alt={movie.title} />
    <h3>{movie.title}</h3>
    <p>{(movie.genres || []).join(', ')}</p>
    <p>{movie.duration} phút</p>
  </Link>
);

export default MovieCard;