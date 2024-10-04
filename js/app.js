const baseUrl = 'https://www.omdbapi.com/';
const apiKey = CONFIG.API_KEY;
let currentPage = 1;
let currentSearch = '';
let currentType = '';

$(document).ready(function() {
    $('#searchBtn').click(function() {
        currentSearch = $('#searchInput').val();
        currentType = $('#typeSelect').val();
        currentPage = 1;
        $('#movieList').empty();
        loadMovies();
    });

    $('#loadMoreBtn').click(function() {
        loadMovies();
    });
});

function loadMovies() {
    $.ajax({
        url: baseUrl,
        data: {
            apikey: apiKey,
            s: currentSearch,
            type: currentType,
            page: currentPage
        },
        method: 'GET',
        success: function(response) {
            if (response.Response === "True") {
                displayMovies(response.Search.slice(0, 9));
                currentPage++;
                
                // Show "Load More" button if there are more results
                if (response.totalResults > currentPage * 9) {
                    $('#loadMoreBtn').show();
                } else {
                    $('#loadMoreBtn').hide();
                }
            } else {
                $('#movieList').html('<p class="text-center">No movies found.</p>');
                $('#loadMoreBtn').hide();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error searching movies:', error);
            $('#movieList').html('<p class="text-center">An error occurred while searching for movies.</p>');
            $('#loadMoreBtn').hide();
        }
    });
}

function displayMovies(movies) {
    let moviePromises = movies.map(movie => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: baseUrl,
                data: {
                    apikey: apiKey,
                    i: movie.imdbID
                },
                method: 'GET',
                success: function(detailedMovie) {
                    resolve(detailedMovie);
                },
                error: function(xhr, status, error) {
                    console.error('Error loading movie details:', error);
                    reject(error);
                }
            });
        });
    });

    Promise.all(moviePromises.map(p => p.catch(e => null)))
        .then(detailedMovies => {
            // Filter out any null results (failed requests)
            detailedMovies = detailedMovies.filter(movie => movie !== null);

            let movieCards = detailedMovies.map(movie => `
                <div class="col-md-4 col-sm-6 movie-card">
                    <div class="movie-card-inner">
                        <div class="movie-poster-container">
                            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Poster'}" alt="${movie.Title}" class="movie-poster">
                        </div>
                        <div class="movie-info">
                            <h3>${movie.Title} (${movie.Year})</h3>
                            <p><strong>Type:</strong> ${movie.Type}</p>
                            <p><strong>Rating:</strong> ${movie.imdbRating}/10</p>
                            <p><strong>Genre:</strong> ${movie.Genre}</p>
                        </div>
                    </div>
                </div>
            `);

            // Group movie cards into rows of 3
            let rows = [];
            for (let i = 0; i < movieCards.length; i += 3) {
                rows.push(movieCards.slice(i, i + 3));
            }

            // Create HTML for rows
            let rowsHTML = rows.map(row => `
                <div class="row">
                    ${row.join('')}
                </div>
            `).join('');

            $('#movieList').append(rowsHTML);
        });
}
