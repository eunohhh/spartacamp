class Node {
    constructor(data) {
        this.data = data;
        this.next = null;           
    }
}

class Queue { 
    constructor(value) {
        this.head = null; 
        this.tail = null;
        this.nodeCount = 1;
    }

    peek(){
        if(this.head === null){
            return null;
        }
        return this.head.data;
    }

    dequeue(){
        if(this.head === null) return null; // 큐가 비어있으면 그냥 null 리턴

        let deletedHead = this.head; // 제거할 node 를 변수에 담아놓기
        this.head = this.head.next; // 그리고 head 를 다음 head로 

        this.nodeCount--;

        return deletedHead;    
    }

    enqueue(){
        let newNode = new Node(value); // 만들고
        if(this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        }else if(this.head.next){
            // 비어있지 않다면 기존 tail 에 새 노드를 포인터로 연결
            this.tail.next = newNode;
            this.tail = newNode; // 새 노드를 테일에 연결
        }
    }
}

const ll = new Queue('ab');



