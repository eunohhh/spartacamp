class SNode {
    constructor(data) {
        this.data = data
        this.next = null                
    }
}

class LinkedList { 
    constructor(value) {
        this.head = new SNode(value); 
        this.nodeCount = 1;
    }


    append(value) {
        let curr = this.head;
        while (curr.next !== null) { 
            curr = curr.next;
        }
        curr.next = new SNode(value);
        this.nodeCount++;
    }

    // 10개가 있다고 했을 때, index번째 인덱스에 있는 노드를 갖고 오고 싶어요
    getNode(index) {
        // 엄밀히 말하면 이 인덱스가 전체 크기를 벗어나는지 검사해야함
        // this.nodeCount 를 근거로 index가 유효한지를 판단 
        // 일단 유효한 index 로 가정
        if(index <= this.nodeCount ){
            let node = this.head; // 링크드 리스트의 Head 를 첫 노드로 지정

            for(let i = 0; i <index; i++){
                node = node.next; // 원하는 위치에 당도할 때 까지 다음 노드로 이동! 
            }
    
            return node
        }else{
            return null
        }
    }

    addNode(value, index){
        const newNode = new SNode(value);
        this.nodeCount++;
        if(index === 0){
            newNode.next = this.head;
            this.head = newNode;
            return;
        }

        const node = this.getNode(index - 1);
        const nextNode = node.next;
        node.next = newNode;
        newNode.next = nextNode;
        
    }
}

const aa = new LinkedList('11');
aa.append('222');
aa.append('333');
aa.append('444');

console.log(aa);
console.log(aa.getNode(2));
aa.addNode('555', 0);
console.log(aa);


// let count = 0;
// let result = null;
// while(curr.next !== null){
//     if(count === index){
//         // console.log(curr.data);
//         result = curr.data
//     }
//     count++;
//     curr = curr.next;
// }
// return result;

// if(index <= this.nodeCount ){
//     let node = this.head;
//     for(let i = 0; i <index; i++){
//         node = new SNode(value) // 원하는 위치에 당도할 때 까지 다음 노드로 이동! 
//     }
// }