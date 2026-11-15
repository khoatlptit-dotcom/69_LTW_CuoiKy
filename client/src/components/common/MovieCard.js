import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => (
  <Link to={`/movies/${movie._id}`}>
    <img src={movie.poster} alt={movie.title} width="150" />
    <h3>{movie.title}</h3>
    <p>{(movie.genres || []).join(', ')}</p>
    <p>{movie.duration} phút</p>
  </Link>
);

export default MovieCard;