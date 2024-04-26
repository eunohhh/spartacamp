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
// 무한스크롤시 계속 추가되는 객체들 담는 애...
let pastMoviesData = {
    page : 0,
    results: [],
    total_pages : 0,
    total_results : 0
};
// 무한스크롤로 객체가 추가되어도 계속 검색이 가능하도록 하기 위해 
// 검색용으로 객체를 계속 추가하는 배열 변수
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

        // 페이지가 1 이면 즉 첫번째 get 요청이면
        if(page === 1){
            // get 결과를 pastMoviesData에 참조해놓기
            pastMoviesData = result;
            // 검색 기준 배열(searchBase)에 results 만 참조해놓기
            searchBase = [...result.results];
        // 무한 스크롤로(인터섹션옵저버가 최하단을 감지하여 새 get요청 보내면)아래 실행
        }else{
            // 새로 get 요청 할때마다 pastMoviesData 에서 results 만 추가추가
            pastMoviesData = {
                page : result.page,
                results : [...pastMoviesData.results, ...result.results],
                total_pages : result.total_pages,
                total_results : result.total_results
            }
            // 검색 기준 배열(searchBase)에도 추가추가
            // 20.. 40...60 이렇게 20개씩 늘어남..
            searchBase = [...pastMoviesData.results, ...result.results]
        }

        return result;

    }catch(error){
        console.log(error)
    }
}

// 각 개별 카드의 html 템플릿 리턴하는 함수
// item : get 요청의 결과값.results[i] object
// rating : 평점 따로 받음 number
// isModal : 모달에서도 같이 사용하기 때문에 모달에 붙일때인지 아닌지 bool
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


/** movies(get 요청의 결과값.results) []
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
// movies 배열로 map 돌리고 cardTemplate 함수를 안에서 사용.. 이거 좋은가?
// isModal 은 역시 : 모달에서도 같이 사용하기 때문에 모달에 붙일때인지 아닌지 bool
const moviesToHtml = (movies, isModal) => {
    
    const mappedHtml = movies.map((e, i) => {
        // rating(영화평점) 소수점 반올림 
        const rating = Math.round(e.vote_average * 10) / 10;
        // cardTemplate 함수 실행
        const html = cardTemplate(e, rating, isModal);

        return html;
    });

    // 콤마 없이 조인
    const joined = mappedHtml.join('');
    return joined
}

// card 들 dom 에 부착하는 함수
// reset : bool true 면 한번 innerHTMl = '' 로 비울때 사용
const drawMovieCards = async (lang, reset) => {

    if(reset) cardsWrapper.innerHTML = '';
    // get 요청 날리고~
    const movies = await getMovies(lang, page);
    // get 요청 결과 가지고 moviesToHtml  
    const movieCardsHtml = moviesToHtml(movies.results, false);
    // 그걸 card wrapper div에 붙여~~
    cardsWrapper.insertAdjacentHTML('beforeend', movieCardsHtml);

    return movies;
}

// 모달 붙이는 함수~
const insertModal = () => {
    // 음 이건 좀 모르겠는데...ㅜㅜ 스크롤 두개 생기는 문제때문에 
    // 모달 붙으면 스크롤 히든
    body.style.overflowY = "hidden";
    // 아래는 그냥 엘리먼트 생성 하는애들
    const modalFull = document.createElement('div');
    modalFull.setAttribute('class', 'searched_modal');
    const temp_html = `<div class="searched_inner"></div>`;
    // 아래는 생성한 애들 붙이는 거~
    modalFull.insertAdjacentHTML('beforeend', temp_html);
    body.insertAdjacentElement('afterbegin', modalFull);

    return modalFull;
}

// 검색 함수
// _ : event 인데 안씀
// searched : string 검색어
const searching = (_, searched) => {

    if(searched.length === 0) {
        alert('검색어를 입력하세요!');
        return;
    }

    // 검색하는 필터 메서드
    // searchBase 배열기준으로 filter
    const filtered = searchBase.filter(e => {
        const lower = e.title.toLowerCase();
        return lower.includes(searched);
    });

    return filtered
}

// 서치버튼 클릭 혹은 엔터키 입력시 실행하는 함수
// e : event
// searched : string 검색어
const handleSearchClickOrEnter = (e, searched) => {
    // 검색 함수 실행
    const searchResult = searching(e, searched);
    // 결과 없으면 얼리 리턴 ? (검색어 입력 안했을때 라거나..)
    if(!searchResult) return;
    // 결과가 빈배열이면(결과값 없으면)
    if(searchResult.length === 0) {
        alert('검색결과가 없습니다!');
        return;
    }
    // 모달 붙여라~
    const modalFull = insertModal();
    // 카드들 html로 ~
    const movieCardsHtml = moviesToHtml(searchResult, true);
    // 모달에 이벤트리스너 달아서 
    // 바깥쪽 클릭이면 꺼지게 하는 애
    modalFull.addEventListener("click", (e) => {
        body.style.overflowY = "auto";
        if (e.target.className === 'searched_modal' || e.target.className === 'searched_inner') e.currentTarget.remove();
    });
    // 모달 제일 위의 첫번째 자식요소에 붙이기
    modalFull.firstChild.insertAdjacentHTML('beforeend', movieCardsHtml)
}

// 키다운(엔터 눌렸을 때) 실행하는 함수
// isDoubleEnter : bool 엔터키 반복인지
// searched : string 검색어
const handleKeyDown = (e, isDoubleEnter, searched) => {
    const modal = document.querySelector('.searched_modal');
    // 키가 엔터면서 반복엔터 아닐때
    if(e.key === 'Enter' && !isDoubleEnter) {
        handleSearchClickOrEnter(e, searched);
        // 한번 엔터 했으면 isDoubleEnter 트루로
        isDoubleEnter = true;
    }else if(modal){
        // 검색 해서 모달 떳으면 false
        isDoubleEnter = false;
    }
}

// 카드 클릭하면 얼러트 띄우는 함수 
const handleCardClick = (e) => {

    const card = e.target.closest('.card');

    if(card) {
        const id = card.dataset.id;
        alert(`영화의 ID 는 : ${id} 입니다.`)
    }
}

// 인터섹션 옵저버 발동 함수, 생성된 마지막 카드를 옵저브
// observer : intersection observer
const observeLastCard = (observer) => {
    // 현재 존재하는 모든 카드 찾어~~
    const cards = document.querySelectorAll('.card');
    // 그중에 마지막 카드 참조~~
    const lastItem = cards[cards.length -1];
    // 주시 시작
    observer.observe(lastItem);
}

// 옵저버 콜백 함수
// entries : 엔트리
// observer : 옵저버 자신??
const ioObserver = (entries, observer) => {

    entries.forEach( async (entry) => {
        // entry 중에서 현재 주시중인 target
        const { target } = entry;
        // 감시대상이 등장하면
        if(entry.isIntersecting){
            // 다음페이지 불러오기 위해 page 전역변수 ++
            page ++;
            // 감시 중단
            observer.unobserve(target);
            // 다음 카드들 불러와서 화면에 그려그려~
            await drawMovieCards(currLang, false);
            // 마지막 카드 다시 감시시작
            observeLastCard(observer);
        }
    });
}

// 언어 선택 버튼 클릭시 실행하는 함수
// _ : event 안씀
// io : 옵저버
// button : button dom
const handleLangButton = async (_, io, button) => {
    // 버튼의 dataset 의 lang 변수에 저장
    const currentTargetLang = button.dataset.lang;
    // 헤더 h1 텍스트도 영어로 바꿔야 하니까 선택
    const headerH1 = document.querySelector('header h1');
    // 한영전환 버튼 누르면 page는 그냥 다시 시작... 1로
    page = 1;
    // 현재 ko 일때 영어로 바꾸는 애들
    if(currentTargetLang === 'ko'){
        button.dataset.lang = 'en';
        currLang = 'en';
        await drawMovieCards('en', true);
        observeLastCard(io);
        headerH1.innerText = 'movieAllmovies';
        searchInput.placeholder = "Let's Search for A Movie";
        searchButton.innerText = "search";
        en.style.textShadow = '1px 1px 2px white, 0 0 1em white, 0 0 0.2em white';
        en.style.color = 'white';
        kr.style.color = '#cfcfcf';
    // 현재 en 일때 영어로 바꾸는 애들
    }else if(currentTargetLang === 'en'){
        button.dataset.lang = 'ko';
        currLang = 'ko';
        await drawMovieCards('ko', true);
        observeLastCard(io);
        headerH1.innerText = '영화다영화';
        searchInput.placeholder = "영화를 검색해보자";
        searchButton.innerText = "검색";
        kr.style.textShadow = '1px 1px 2px white, 0 0 1em white, 0 0 0.2em white';
        kr.style.color = 'white';
        en.style.color = '#cfcfcf';
    }
}

// 검색할 때 (검색할 때마다 실행되는) 함수
const handleSearchInput = event => {
    let value = event.target.value;
    // 검색어 영어인지 판단할 정규표현식
    const regex = /[a-zA-Z]/;
    // 만약 영어면
    if(regex.test(value)){
        // 소문자화
        searchValue = value.toLowerCase();
    }else{
        searchValue = value;
    }
};

// 탑버튼 클릭하면 실행할 함수
const handleTopButton = () => {
    // 화면 최상단으루,,,
    window.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    })
}

// init 함수!
const init = async () => {
    // 모바일용 화면 vh 값 계산 하기 위해서~~  
    window.addEventListener("orientationchange", handleOrientationChange, false);
    window.addEventListener('resize', setScreenSize);
    window.dispatchEvent(new Event("resize"));

    // 시작과 함께, 영화 목록 받아오기
    await drawMovieCards(currLang, false);
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

// init 함수 실행!
init();

