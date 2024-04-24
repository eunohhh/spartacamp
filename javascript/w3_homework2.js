var fullname = 'Ciryl Gane'

var fighter = {
    fullname: 'John Jones',
    opponent: {
        fullname: 'Francis Ngannou',
        getFullname: function () {
            console.log(this)

            return this.fullname;
        }
    },

    getName: function() {
        return this.fullname;
    },

    // getFirstName: () => {
    //     return this.fullname.split(' ')[0];
    // },

    // getLastName: (function() {
    //     return this.fullname.split(' ')[1];
    // })()

    getFirstName: function() {
        return this.fullname.split(' ')[0];
    },

    getLastName: function() {
        return this.fullname.split(' ')[1];
    }

}

console.log('Not', fighter.opponent.getFullname(), 'VS', fighter.getName());
// console.log('It is', fighter.getName(), 'VS', fighter.getFirstName(), fighter.getLastName);
console.log('It is', fighter.getName(), 'VS', fighter.getFirstName(), fighter.getLastName.apply({fullname : fullname}));