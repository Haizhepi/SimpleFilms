from flask import Flask, jsonify, make_response, request, send_from_directory
import requests
import os
from flask_cors import CORS


app = Flask(__name__, static_url_path='', static_folder='static')

CORS(app);
ROOT_URI = "https://api.themoviedb.org/3"
API_KEY = "?api_key=a62b092f963cce3979db513811305924"
API_KEY2 = "a62b092f963cce3979db513811305924"

movie_genre = {};
tv_genre = {};

@app.before_first_request
def before_first_request():
    tmdb_response = requests.get(ROOT_URI + "/genre/movie/list" + API_KEY)
    data = tmdb_response.json()
    for token in data['genres']:
        movie_genre[token['id']] = token['name']
    
    tmdb_response = requests.get(ROOT_URI + "/genre/tv/list" + API_KEY)
    data = tmdb_response.json()
    for token in data['genres']:
        tv_genre[token['id']] = token['name']
    
    res = requests.get('https://api.themoviedb.org/3/tv/60735?api_key=a62b092f963cce3979db513811305924&language=en-US')
    # print(res.json())

@app.route('/')
def root():
    return app.send_static_file('index.html');

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('static/css', path)

@app.route('/trending', methods=['GET'])
def trending():
    tmdb_response = requests.get(ROOT_URI + "/trending/movie/week" + API_KEY)
    result_json = tmdb_response.json()
    min_len = min(5, len(result_json));
    print(len(result_json));
    five_results = result_json['results'][:min_len + 1]
    movies = list()
    for movie in five_results:
        movie_dict = {"title": movie.get('title', 'N/A'), "backdrop_path": movie.get("backdrop_path", 'N/A'), "release_date": movie.get("release_date", 'N/A')}
        movies.append(movie_dict)
    response = make_response(jsonify(movies), 200);
    return response

@app.route('/airing', methods=['GET'])
def airing():
    tmdb_response = requests.get(ROOT_URI + "/tv/airing_today" + API_KEY)
    result_json = tmdb_response.json()
    min_len = min(5, len(result_json));
    five_results = result_json['results'][:min_len + 1]
    tvs = list()
    for tv in five_results:
        tv_dict = {"name": tv.get('name', 'N/A'), "backdrop_path": tv.get("backdrop_path", 'N/A'), "first_air_date": tv.get("first_air_date", 'N/A')}
        tvs.append(tv_dict)
    response = make_response(jsonify(tvs), 200);
    return response

def getMovieDict(movie):
    genre_ids = movie['genre_ids'];
    genres = list()
    print(movie)    
    for id in genre_ids:
        genres.append(movie_genre[id])
    if len(genres) == 0:
        genres.append("N/A")
    movie_dict = {'title': movie.get('title', 'N/A'),
        'id': movie['id'],
        'overview': movie.get('overview', 'N/A'),
        'poster_path': movie['poster_path'],
        'release_date': movie.get('release_date', 'N/A'),
        'vote_average': movie.get('vote_average', 'N/A'),
        'vote_count': movie.get('vote_count', 'N/A'),
        'genres': genres,
        'media_type': 'movie'
    }
    return movie_dict

def getTVDict(tv):
    genre_ids = tv['genre_ids'];
    genres = list()
    for id in genre_ids:
        genres.append(tv_genre[id])
    if len(genres) == 0:
        genres.append("N/A")
    tv_dict = {'name': tv['name'],
        'id': tv['id'],
        'overview': tv.get('overview', 'N/A'),
        'poster_path': tv['poster_path'],
        'first_air_date': tv.get('first_air_date', 'N/A'),
        'vote_average': tv.get('vote_average', 'N/A'),
        'vote_count': tv.get('vote_count', 'N/A'),
        'genres': genres,
        'media_type': 'tv'
    }
    return tv_dict

@app.route('/movie', methods=['GET'])
def searchMovie():
    search_movie = request.args.get('query')
    url = ROOT_URI + '/search/movie' + API_KEY + '&query=' + search_movie + '&language=en-US&page=1&include_adult=false'
    tmdb_response = requests.get(url);
    result_json = tmdb_response.json()['results']
    movies = list()
    for movie in result_json:
        movies.append(getMovieDict(movie))
    response = make_response(jsonify(movies), 200);
    return response


@app.route('/t', methods=['GET'])
def tvDetail(): 
    tv_id = request.args.get('id')
    tv_dict = {}
    url = ROOT_URI + '/tv/' + tv_id + API_KEY + '&language=en-US'
    tmdb_response = requests.get(url);
    tv_detail = tmdb_response.json()
    tv_dict['backdrop_path'] = tv_detail.get('backdrop_path', '/');
    tv_dict['first_air_date'] = tv_detail.get('first_air_date', 'N/A');
    tv_dict['genres'] = []
    for genre in tv_detail['genres']:
        tv_dict['genres'].append(genre['name'])
    if len(tv_dict['genres']) == 0:
        tv_dict['genres'].append('N/A')
    tv_dict['name'] = tv_detail.get('name', 'N/A')
    tv_dict['vote_average'] = tv_detail.get('vote_average', 'N/A')
    tv_dict['vote_count'] = tv_detail.get('vote_count', 'N/A')
    tv_dict['number_of_seasons'] = tv_detail.get('number_of_seasons', 'N/A')

    tv_dict['spoken_languages'] = []
    if tv_detail.get('spoken_languages', 'N/A') != 'N/A':
        for token in tv_detail.get('spoken_languages', 'N/A'):
            tv_dict['spoken_languages'].append(token.get('english_name', 'N/A'))
    tv_dict['overview'] = tv_detail.get('overview', 'N/A')

    url = ROOT_URI + '/tv/' + tv_id + '/credits' + API_KEY + '&language=en-US'
    tmdb_response = requests.get(url);
    credits_detail = tmdb_response.json()['cast']
    tv_dict['casts'] = []
    for i in range(0, min(len(credits_detail), 8)):
        cast_dict = {}
        cast_dict['character'] = credits_detail[i].get('character', 'N/A')
        cast_dict['name'] = credits_detail[i].get('name', 'N/A')
        cast_dict['profile_path'] = credits_detail[i].get('profile_path', 'N/A')
        tv_dict['casts'].append(cast_dict)

    url = ROOT_URI + '/tv/' + tv_id + '/reviews' + API_KEY + '&language=en-US&page=1'
    tmdb_response = requests.get(url)
    reviews_detail = tmdb_response.json()['results']
    tv_dict['reviews'] = []
    for i in range(0, min(len(reviews_detail), 5)):
        review_dict = {}
        review_dict['author'] = reviews_detail[i]['author_details'].get('username', 'N/A')
        review_dict['content'] = reviews_detail[i].get('content', 'N/A')
        review_dict['created_at'] = reviews_detail[i].get('created_at', 'N/A')
        review_dict['rating'] = reviews_detail[i]['author_details'].get('rating', 'N/A')
        tv_dict['reviews'].append(review_dict)

    response = make_response(jsonify(tv_dict), 200);
    return response

@app.route('/m', methods=['GET'])
def movieDetail(): 
    movie_id = request.args.get('id')
    movie_dict = {}
    url = ROOT_URI + '/movie/' + movie_id + API_KEY + '&language=en-US'
    tmdb_response = requests.get(url);
    movie_detail = tmdb_response.json()
    movie_dict['backdrop_path'] = movie_detail.get('backdrop_path', 'N/A');
    movie_dict['release_date'] = movie_detail.get('release_date', 'N/A');
    movie_dict['genres'] = []
    for genre in movie_detail['genres']:
        movie_dict['genres'].append(genre['name'])
    if len(movie_dict['genres']) == 0:
        movie_dict['genres'].append('N/A')
    movie_dict['title'] = movie_detail.get('title', 'N/A');
    movie_dict['vote_average'] = movie_detail.get('vote_average', 'N/A');
    movie_dict['vote_count'] = movie_detail.get('vote_count', 'N/A');
    movie_dict['spoken_languages'] = []
    if movie_detail.get('spoken_languages', 'N/A') != 'N/A':
        for token in movie_detail.get('spoken_languages', 'N/A'):
            movie_dict['spoken_languages'].append(token.get('english_name', 'N/A'))
    movie_dict['overview'] = movie_detail.get('overview', 'N/A');

    url = ROOT_URI + '/movie/' + movie_id + '/credits' + API_KEY + '&language=en-US'
    tmdb_response = requests.get(url);
    credits_detail = tmdb_response.json()['cast']
    movie_dict['casts'] = []
    for i in range(0, min(len(credits_detail), 8)):
        cast_dict = {}
        cast_dict['character'] = credits_detail[i].get('character', 'N/A')
        cast_dict['name'] = credits_detail[i].get('name', 'N/A')
        cast_dict['profile_path'] = credits_detail[i].get('profile_path', 'N/A')
        movie_dict['casts'].append(cast_dict)

    url = ROOT_URI + '/movie/' + movie_id + '/reviews' + API_KEY + '&language=en-US&page=1'
    tmdb_response = requests.get(url)
    reviews_detail = tmdb_response.json()['results']
    movie_dict['reviews'] = []
    for i in range(0, min(len(reviews_detail), 5)):
        review_dict = {}
        review_dict['author'] = reviews_detail[i]['author_details'].get('username', 'N/A')
        review_dict['content'] = reviews_detail[i].get('content', 'N/A')
        review_dict['created_at'] = reviews_detail[i].get('created_at', 'N/A')
        review_dict['rating'] = reviews_detail[i]['author_details'].get('rating', 'N/A')
        movie_dict['reviews'].append(review_dict)

    response = make_response(jsonify(movie_dict), 200);
    return response

@app.route('/tv', methods=['GET'])
def searchTV():
    search_tv = request.args.get('query')
    url = ROOT_URI + '/search/tv' + API_KEY + '&query=' + search_tv + '&language=en-US&page=1&include_adult=false'
    tmdb_response = requests.get(url);
    result_json = tmdb_response.json()['results']
    tvs = list()
    for tv in result_json:
        tvs.append(getTVDict(tv))
    response = make_response(jsonify(tvs), 200);
    return response

@app.route('/multi', methods=['GET'])
def searchMulti():
    search = request.args.get('query')
    url = ROOT_URI + '/search/multi'+ API_KEY + '&language=en-US&query='+ search +'&page=1&include_adult=false'
    tmdb_response = requests.get(url);
    result_json = tmdb_response.json()['results']
    tv_movies = list()

    for tvm in result_json:
        type = tvm['media_type']
        if type == 'movie':
            tv_movies.append(getMovieDict(tvm))
        elif type == 'tv':
            tv_movies.append(getTVDict(tvm));
    response = make_response(jsonify(tv_movies), 200);
    return response 

if __name__ == "__main__":
    app.run(debug=True)