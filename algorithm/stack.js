class Node {
    constructor(data) {
        this.data = data
        this.next = null                
    }
}

class Stack { 
    constructor(value) {
        this.head = new Node(value); 
        this.nodeCount = 1;
    }

    peek(){
        if(this.head === null){
            return null;
        }
        return this.head.data;
    }

    push(value){
        let newHead = new Node(value); // 3 을 만들고
        newHead.next = this.head; // 3 => 4 로 만든다음에
        this.head = newHead; // 현재 head 의 값을 3 으로 바꿔준다.
        this.nodeCount++;
    }

    pop(){
        if(this.head === null) return null; // 스택이 비어있으면 그냥 null 리턴

        let deletedHead = this.head; // 제거할 node 를 변수에 담아놓기
        this.head = this.head.next; // 그리고 head 를 다음 head로 

        this.nodeCount--;

        return deletedHead;
    }
}

const ll = new Stack('ab');
ll.push('abc');
ll.push('abcd');
ll.push('abcde');

console.log(ll);

setTimeout(() => {
    const dd = ll.pop();

    console.log(dd)

}, 3000);


