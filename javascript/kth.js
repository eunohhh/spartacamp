function solution(array, commands) {
    let answer = [];

    for (let i = 0; i < commands.length; i++) {
        const sliced = array.slice(commands[i][0] - 1, commands[i][1]);

        console.log(sliced);

        sliced.sort((a, b) => a - b);

        answer.push(sliced[commands[i][2] - 1]);
    }

    return answer;
}

const qArray = [1, 5, 2, 6, 3, 7, 4];
const qCommands = [
    [2, 5, 3],
    [4, 4, 1],
    [1, 7, 3],
];

const result = solution(qArray, qCommands);

console.log(result);
