const cardsWrapper = document.getElementById('cards_wrapper');
const searchInput = document.getElementById('search_input');
const searchButton = document.querySelector('.search_submit');
const langButton = document.querySelector('.lang_change');
const topButton = document.getElementById('top_button');
// 바디 선택(모달을 바디에 붙일예정)
const body = document.body;
let searchValue = '';
let isDoubleEnter = false;
let page = 1;
let currLang = 'ko';
let pastMoviesData = {
    page : 0,
    results: [],
    total_pages : 0,
    total_results : 0
};
let baseMovies = {};
let searchBase = [];

const getMovies = async (lang, page) => {

    let mergedMoviesData = {};

    let langSet = '';
    if(lang === "ko"){
        langSet = 'ko-kr';
    }else if(lang === 'en'){
        langSet = 'en-US';
    }

    const url = `https://api.themoviedb.org/3/movie/top_rated?language=${langSet}&page=${page}`;

    const req = {
        method: 'GET',
        headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
        }
    };

    try {
        // fetch POST
        const response = await fetch(url, req);
        // 응답이 not ok 면 에러 쓰로우
        if(!response.ok){
            throw new Error('서버 응답 실패');
        }
        const result = await response.json();

        /** result
         * page: 현재 페이지
         * results : 20개씩 담긴 어레이
         * total_pages : 영화정보 전체 페이지 수
         * total_results : 전체 영화 수
         */

        if(page > 0){
            mergedMoviesData = {
                page : result.page,
                results : [...pastMoviesData.results, ...result.results],
                total_pages : result.total_pages,
                total_results : result.total_results
            }
            searchBase = [...pastMoviesData.results, ...result.results]
        }else{
            mergedMoviesData = result;
            searchBase = [...result.results];
        }

        pastMoviesData = mergedMoviesData;
        
        return result;

    }catch(error){
        console.log(error)
    }
}

const cardTemplate = (item, rating, isModal = false) => {
    const html = `
            <div class='card ${isModal ? 'modal-card' : ''}' data-id=${item.id}>
                <div class='movie_poster_box'>
                    <img src='https://image.tmdb.org/t/p/w500${item.poster_path}' alt='poster' />
                </div>
                <div class='movie_info'>
                    <h2>${item.title}</h2>
                    <span>평점 : ${rating}</span>
                    <p>${item.overview}</p>
                </div>
            </div>
        `;

    return html;
}
/** movies
 *  adults : boolean 성인여부
 *  backdrop_path : string 배경 와이드 이미지 주소
 *  genre_ids : number[] 장르 아이디인듯?
 *  id : number 아이디
 *  original_language : string 기본 언어
 *  original_title : string 기본 영화 제목
 *  overview : string 번역된 영화 설명
 *  popularity : number
 *  poster_path : string 포스터 세로 이미지 주소
 *  release_date : string 개봉일
 *  title : string 번역된 타이틀
 *  video : boolean
 *  vote_average : number
 *  vote_count : number
 */
const moviesToHtml = (movies, isModal) => {

    const mappedHtml = movies.map((e, i) => {

        const rating = Math.round(e.vote_average * 10) / 10;

        const html = cardTemplate(e, rating, isModal);

        return html;
    });

    // 콤마 없이 조인
    const joined = mappedHtml.join('');
    return joined
}

const drawMovies = async (lang, reset) => {

    if(reset) cardsWrapper.innerHTML = '';

    const movies = await getMovies(lang, String(page));

    // console.log(searchBase)

    const movieCardsHtml = moviesToHtml(movies.results, false);

    cardsWrapper.insertAdjacentHTML('beforeend', movieCardsHtml);

    baseMovies = movies;

    return movies;
}

const searching = (_, searched) => {

    if(searched.length === 0) {
        alert('검색어를 입력하세요!');
        return;
    }

    const filtered = searchBase.filter(e => {
        return e.title.includes(searched);
    });

    if(filtered.length > 0){
        return filtered;
    }else{
        return [];
    }
}

const insertModal = () => {

    const modalFull = document.createElement('div');
    modalFull.setAttribute('class', 'searched_modal');

    const temp_html = `<div class="searched_inner"></div>`;

    modalFull.insertAdjacentHTML('beforeend', temp_html);
    body.insertAdjacentElement('afterbegin', modalFull);

    return modalFull;
}

const handleSearchClickOrEnter = (e, searched) => {
    const searchResult = searching(e, searched);

    if(!searchResult) return;

    if(searchResult.length === 0) {
        alert('검색결과가 없습니다!');
        return;
    }

    const modalFull = insertModal();

    const movieCardsHtml = moviesToHtml(searchResult, true);

    modalFull.addEventListener("click", (e) => {
        if (e.target.className === 'searched_inner') e.currentTarget.remove();
    });

    modalFull.firstChild.insertAdjacentHTML('beforeend', movieCardsHtml)
}

const handleKeyDown = (e, isDoubleEnter, searched) => {
    const modal = document.querySelector('.searched_modal');

    if(e.key === 'Enter' && !isDoubleEnter) {
        handleSearchClickOrEnter(e, searched);
        isDoubleEnter = true;
    }else if(modal){
        isDoubleEnter = false;
    }
}

const handleCardClick = (e) => {

    const card = e.target.closest('.card');

    if(card) {
        const id = card.dataset.id;
        alert(`영화의 ID 는 : ${id} 입니다.`)
    }
}

const observeLastCard = (observer) => {

    const cards = document.querySelectorAll('.card');

    const lastItem = cards[cards.length -1];
    // 주시 시작
    observer.observe(lastItem);
}

const ioObserver = (entries, observer) => {

    entries.forEach( async (entry) => {

        const { target } = entry;

        if(entry.isIntersecting){
            observer.unobserve(target);
            page ++;
            // 여기서 분기처리
            await drawMovies(currLang, false);
            observeLastCard(observer);
        }
    });
}

const handleLangButton = async (_, io, button) => {
    const currentTargetLang = button.dataset.lang;

    if(currentTargetLang === 'ko'){
        page = 1;
        button.dataset.lang = 'en';
        currLang = 'en';
        await drawMovies('en', true);
        observeLastCard(io);
    }else if(currentTargetLang === 'en'){
        page = 1;
        button.dataset.lang = 'ko';
        currLang = 'ko';
        await drawMovies('ko', true);
        observeLastCard(io);
    }
}

const handleTopButton = () => {
    window.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    })
}

const init = async () => {
    await drawMovies(currLang, false);

    topButton.addEventListener('click', handleTopButton)

    const intersectionObserver = new IntersectionObserver((entries, observer) => ioObserver(entries, observer));
    observeLastCard(intersectionObserver);

    langButton.addEventListener('click', (e) => handleLangButton(e, intersectionObserver, langButton));

    cardsWrapper.addEventListener('click', handleCardClick);

    
    
    const handleSearchInput = event => searchValue = event.target.value;
    searchInput.addEventListener("input", handleSearchInput);
    
    searchButton.addEventListener('click', (e) => handleSearchClickOrEnter(e, searchValue));
    searchInput.addEventListener('keydown', (e) => handleKeyDown(e, isDoubleEnter, searchValue));
    
}

init();

