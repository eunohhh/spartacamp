function bubbleSort(array){

    for(let i = 0; i < array.length; i++){
        // 버블 정렬 알고리즘의 특성상 하나씩 줄어들며 비교
        for(let j = 0; i < array.length -i -1; j++){
            if(array[j] > array[j + 1]){ // 앞의 원소가 뒤의 원소보다 크면 바꾼다
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
    }

    return array
}

const result = bubbleSort([4,2,6,1,9]);

console.log(result);