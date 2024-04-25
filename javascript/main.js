function countSrt(str){
  const splitted = str.split('');

  const answer = splitted.reduce((acc, curr)=>{
    if (curr in acc) {
      acc[curr]++;
    } else {
      acc[curr] = 1;
    }
    return acc;
  }, {})

  return answer
}

const answer1 = countSrt('spartan')



function reverse(str) {
  const strToArray = str.split('');
  const answer = strToArray.reverse().join('');
  return answer;  
}

reverse('spartan');

function summary(str){
  let answer = '';
  const splitted = str.split('');
  const reduced = splitted.reduce((acc, curr)=>{
    let temp = 1;
    if (curr in acc) {
      temp++;
      acc[curr] = `${curr}/${temp}`
    } else {
      temp = 1;  
      acc[curr] = `${curr}/${temp}`
    }
    return acc;
  }, {})

  for(const value of Object.values(reduced)){
    answer += value
  }
  return answer
}

summary('spartan')

function prime(num) {
	if(num === 1) return false; 
  for(let i = 2; i < num; i++) {
    if(num % i === 0) return false;
	} 
  return true; 
}
