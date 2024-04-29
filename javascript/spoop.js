function solution(s){
    
    const lowerCase = s.toLowerCase();
    
    const regex = /p|y/g;
    
    const matched = lowerCase.matchAll(regex);

    if(matched.length === 0) {
        answer = true;
    }else{
        let counter = 0;

        matched.forEach(e => {
            if(e[0] === 'p'){
                counter++;
            }else if(e[0] === 'y'){
                counter--;
            }
        });
        
        counter === 0 ? answer = true : answer = false;
    }

    return answer;
}

solution("ppoooyy");