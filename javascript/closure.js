let cumulativeNum = 0;
const options = {};

const fetchNext = (async() => {
	let accData = [];

	return async () => {
		const nextNum = cumulativeNum + 5;

		for (let page = cumulativeNum; page < nextNum; page++) {
			// 각 페이지 요청에 대한 프로미스 생성
			const result = await fetch(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`, options);
			const data = await result.json();

			accData.push(data.results);
		}

		cumulativeNum = nextNum;

		return accData;
	}		
})();

const closure = await fetchNext;
const totalPages = await closure();