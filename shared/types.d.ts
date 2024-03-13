// export type Language = 'English' | 'Frenc
//数据格式定义

export type Movie =   {
  id: number,
  backdrop_path: string,
  genre_ids: number[ ],
  original_language: string,
  original_title: string,
  adult: boolean,
  overview: string,
  popularity: number,
  poster_path: string,
  release_date: string,
  title: string,
  video: boolean,
  vote_average: number,
  vote_count: number
}

export type MovieCast = {
  movieId: number;
  actorName: string;
  roleName: string;
  roleDescription: string;
};
// Used to validate the query string og HTTP Get requests
export type MovieCastMemberQueryParams = {
  movieId: string;
  actorName?: string;
  roleName?: string
};
//新建movieReview数据库
export type MovieReview = {
  MovieId: number;
  ReviewerName: string;
  ReviewDate: string;
  Content: string;
  Rating: number; 
}

 