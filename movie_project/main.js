// 이것저것 선택자
const cardsWrapper = document.getElementById('cards_wrapper');
const searchInput = document.getElementById('search_input');
const searchButton = document.querySelector('.search_submit');
const langButton = document.querySelector('.lang_change');
const topButton = document.getElementById('top_button');
const kr = langButton.lastElementChild;
const en = langButton.firstElementChild;

const body = document.body;
// 검색어 입력 값 저장용 변수
let searchValue = '';
// 엔터 두번째인지 판정용 변수
let isDoubleEnter = false;
// get 요청할 때 몇번째 페이지로 요청할지 증가하는 변수
let page = 1;
// 국영문 제어용 변수
let currLang = 'ko';
// 무한스크롤시 계속 추가되는 객체들 이전과 비교하기 위한 상태 변수
let pastMoviesData = {
    page : 0,
    results: [],
    total_pages : 0,
    total_results : 0
};
// 무한스크롤로 객체가 추가되어도 계속 검색이 가능하도록 하기 위해 
// 검색용으로 객체를 계속 추가하는 변수
let searchBase = [];

// css --vh 변수를 위한 innerHeight 사이즈 계산
function setScreenSize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// orientationchange 이벤트를 위한 resize 이벤트 트리거 함수
function handleOrientationChange() {
    window.dispatchEvent(new Event("resize"));
};

// 영화 목록 get 요청하는 함수
const getMovies = async (lang, page) => {

    const strPage = String(page);
    // 검색결과 중복 오류가 자꾸 나서
    // 방지용으로 만든 임시 객체??
    let mergedMoviesData = {};

    // 언어 변경용
    let langSet = '';
    if(lang === "ko"){
        langSet = 'ko-kr';
    }else if(lang === 'en'){
        langSet = 'en-US';
    }

    const url = `https://api.themoviedb.org/3/movie/top_rated?language=${langSet}&page=${strPage}`;

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

        // 페이지가 0 이면 즉 첫번째 get 요청이면
        if(page === 1){
            mergedMoviesData = result;
            searchBase = [...result.results];
        }else{
            mergedMoviesData = {
                page : result.page,
                results : [...pastMoviesData.results, ...result.results],
                total_pages : result.total_pages,
                total_results : result.total_results
            }
            searchBase = [...pastMoviesData.results, ...result.results]
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

    const movies = await getMovies(lang, page);

    // console.log(searchBase)

    const movieCardsHtml = moviesToHtml(movies.results, false);

    cardsWrapper.insertAdjacentHTML('beforeend', movieCardsHtml);

    return movies;
}

const insertModal = () => {

    body.style.overflowY = "hidden";
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
        body.style.overflowY = "auto";
        if (e.target.className === 'searched_modal' || e.target.className === 'searched_inner') e.currentTarget.remove();
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
            page ++;
            observer.unobserve(target);
            // 여기서 분기처리
            await drawMovies(currLang, false);
            observeLastCard(observer);
        }
    });
}

const handleLangButton = async (_, io, button) => {
    const currentTargetLang = button.dataset.lang;
    const headerH1 = document.querySelector('header h1');
    page = 1;
    if(currentTargetLang === 'ko'){
        button.dataset.lang = 'en';
        currLang = 'en';
        await drawMovies('en', true);
        observeLastCard(io);
        headerH1.innerText = 'movieAllmovies';
        searchInput.placeholder = "Let's Search for A Movie";
        searchButton.innerText = "search";
        en.style.textShadow = '1px 1px 2px white, 0 0 1em white, 0 0 0.2em white';
        en.style.color = 'white';
        kr.style.color = '#cfcfcf';
    }else if(currentTargetLang === 'en'){
        button.dataset.lang = 'ko';
        currLang = 'ko';
        await drawMovies('ko', true);
        observeLastCard(io);
        headerH1.innerText = '영화다영화';
        searchInput.placeholder = "영화를 검색해보자";
        searchButton.innerText = "검색";
        kr.style.textShadow = '1px 1px 2px white, 0 0 1em white, 0 0 0.2em white';
        kr.style.color = 'white';
        en.style.color = '#cfcfcf';
    }
}

const handleSearchInput = event => {
    let value = event.target.value;
    const regex = /[a-zA-Z]/;
    if(regex.test(value)){
        searchValue = value.toLowerCase();
    }else{
        searchValue = value;
    }
};

const handleTopButton = () => {
    window.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    })
}

const init = async () => {
    /** ====== Generate a resize event if the device doesn't do it ====== */  
    window.addEventListener("orientationchange", handleOrientationChange, false);
    window.addEventListener('resize', setScreenSize);
    window.dispatchEvent(new Event("resize"));

    // 시작과 함께, 영화 목록 받아오기
    await drawMovies(currLang, false);
    // 탑버튼에 이벤트리스너 장착
    topButton.addEventListener('click', handleTopButton)
    // 검색버튼에 포커스
    searchInput.focus();

    // 인터섹션 옵서버 생성 및 콜백 적용
    // 옵저브 시작 함수 실행
    const intersectionObserver = new IntersectionObserver((entries, observer) => ioObserver(entries, observer), {threshold: 0.8});
    observeLastCard(intersectionObserver);

    // 언어전환버튼에 이벤트 리스너 장착
    langButton.addEventListener('click', (e) => handleLangButton(e, intersectionObserver, langButton));

    // 카드 클릭시 id 출력하는 이벤트 리스너 장착
    cardsWrapper.addEventListener('click', handleCardClick);

    // 검색값 받아오는 이벤트 리스너 장착
    searchInput.addEventListener("input", handleSearchInput);
    
    // 검색버튼 누를시 검색 실행하는 이벤트 리스너 장착
    searchButton.addEventListener('click', (e) => handleSearchClickOrEnter(e, searchValue));
    // 엔터키 눌러도 똑같이 동작하도록 하는 이벤트 리스너 장착
    searchInput.addEventListener('keydown', (e) => handleKeyDown(e, isDoubleEnter, searchValue));
}

init();

