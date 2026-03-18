import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../utils/logger';
import type {
  GenreListResponse,
  MovieListResponse,
  TvListResponse,
  TrendingMovieResponse,
  TrendingTvResponse,
  DiscoverParams,
} from './types';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY  = 'add494e96808c55b3ee7f940c9d5e5b6';

export class TmdbApiClient {
  private readonly request: APIRequestContext;
  private readonly logger: Logger;

  constructor(request: APIRequestContext, logger: Logger) {
    this.request = request;
    this.logger  = logger;
  }

  async getMovieGenres(): Promise<{ response: APIResponse; body: GenreListResponse }> {
    return this.get<GenreListResponse>('/genre/movie/list');
  }

  async getTvGenres(): Promise<{ response: APIResponse; body: GenreListResponse }> {
    return this.get<GenreListResponse>('/genre/tv/list');
  }

  async getPopularMovies(page = 1): Promise<{ response: APIResponse; body: MovieListResponse }> {
    return this.get<MovieListResponse>('/movie/popular', { page });
  }

  async getNowPlayingMovies(page = 1): Promise<{ response: APIResponse; body: MovieListResponse }> {
    return this.get<MovieListResponse>('/movie/now_playing', { page });
  }

  async getTopRatedMovies(page = 1): Promise<{ response: APIResponse; body: MovieListResponse }> {
    return this.get<MovieListResponse>('/movie/top_rated', { page });
  }

  async getTrendingMovies(page = 1): Promise<{ response: APIResponse; body: TrendingMovieResponse }> {
    return this.get<TrendingMovieResponse>('/trending/movie/week', { page });
  }

  async getPopularTv(page = 1): Promise<{ response: APIResponse; body: TvListResponse }> {
    return this.get<TvListResponse>('/tv/popular', { page });
  }

  async getOnAirTv(page = 1): Promise<{ response: APIResponse; body: TvListResponse }> {
    return this.get<TvListResponse>('/tv/on_the_air', { page });
  }

  async getTopRatedTv(page = 1): Promise<{ response: APIResponse; body: TvListResponse }> {
    return this.get<TvListResponse>('/tv/top_rated', { page });
  }

  async getTrendingTv(page = 1): Promise<{ response: APIResponse; body: TrendingTvResponse }> {
    return this.get<TrendingTvResponse>('/trending/tv/week', { page });
  }

  async searchMovies(query: string, page = 1): Promise<{ response: APIResponse; body: MovieListResponse }> {
    return this.get<MovieListResponse>('/search/movie', { query, page });
  }

  async discoverMovies(params: DiscoverParams = {}): Promise<{ response: APIResponse; body: MovieListResponse }> {
    return this.get<MovieListResponse>('/discover/movie', params);
  }

  async discoverTv(params: DiscoverParams = {}): Promise<{ response: APIResponse; body: TvListResponse }> {
    return this.get<TvListResponse>('/discover/tv', params);
  }


  private async get<T>(path: string, params: Record<string, unknown> | DiscoverParams = {}): Promise<{ response: APIResponse; body: T }> {
    const url = `${BASE_URL}${path}`;
    const queryParams = { api_key: API_KEY, ...params };

    this.logger.info(`GET ${path} | params: ${JSON.stringify(params)}`);

    const response = await this.request.get(url, { params: queryParams });
    const body     = await response.json() as T;

    this.logger.info(`→ ${response.status()} ${response.statusText()}`);

    return { response, body };
  }
}
