$(document).ready(function() {
    const apiKey = CONFIG.API_KEY;
    const baseUrl = 'https://www.omdbapi.com/';
    let currentPage = 1;
    let currentSearch = '';
    let currentType = 'movie';
    let totalResults = 0;

    // Event listeners
    $('#searchBtn').on('click', searchMovies);
    $('#searchInput').on('keypress', function(e) {
        if (e.which === 13) {
            searchMovies();
        }
    });
    $('#loadMoreBtn').on('click', loadMoreMovies);
    $('#typeSelect').on('change', function() {
        currentType = $(this).val();
    });

    function searchMovies() {
        currentSearch = $('#searchInput').val().trim();
        if (!currentSearch) {
            alert('Please enter a search term');
            return;
        }
        currentPage = 1;
        loadMovies();
    }

    function loadMovies() {
        $('#movieList').append('<div class="col-12 text-center"><h3>Loading...</h3></div>');
        $('#loadMoreBtn').hide();

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
                $('#movieList').find('h3').remove();
                if (response.Response === "True") {
                    if (currentPage === 1) {
                        $('#movieList').empty();
                        totalResults = parseInt(response.totalResults);
                    }
                    displayMovies(response.Search);
                    toggleLoadMoreButton();
                } else {
                    $('#movieList').html(`<div class="col-12 text-center"><h3>${response.Error}</h3></div>`);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading movies:', error);
                $('#movieList').html(`<div class="col-12 text-center"><h3>An error occurred. Please try again.</h3></div>`);
            }
        });
    }

    function loadMoreMovies() {
        currentPage++;
        loadMovies();
    }


function displayMovies(movies) {
    let row = $('<div class="row"></div>');
    movies.forEach((movie, index) => {
        $.ajax({
            url: baseUrl,
            data: {
                apikey: apiKey,
                i: movie.imdbID
            },
            method: 'GET',
            success: function(detailedMovie) {
                const movieCard = `
                    <div class="col-md-4 col-sm-6 movie-card">
                        <div class="movie-card-inner">
                            <div class="movie-poster-container">
                                <img src="${detailedMovie.Poster !== 'N/A' ? detailedMovie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Poster'}" alt="${detailedMovie.Title}" class="movie-poster">
                            </div>
                            <div class="movie-info">
                                <h3>${detailedMovie.Title} (${detailedMovie.Year})</h3>
                                <p><strong>Type:</strong> ${detailedMovie.Type}</p>
                                <p><strong>Rating:</strong> ${detailedMovie.imdbRating}/10</p>
                                <p><strong>Genre:</strong> ${detailedMovie.Genre}</p>
                            </div>
                        </div>
                    </div>
                `;
                row.append(movieCard);
                
                // After every 3rd movie or at the end, append the row and start a new one
                if ((index + 1) % 3 === 0 || index === movies.length - 1) {
                    $('#movieList').append(row);
                    row = $('<div class="row"></div>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading movie details:', error);
            }
        });
    });
}


    function toggleLoadMoreButton() {
        const currentMoviesCount = $('#movieList .movie-card').length;
        $('#loadMoreBtn').toggle(currentMoviesCount < totalResults);
    }
});
