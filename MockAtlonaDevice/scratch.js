// just for messing about in - remove before release

var num = 5;
var numAsString = "5";
var nonExistant;

console.info(num == numAsString);
console.info(num === numAsString);

if (nonExistant == 5)console.info("undefined returns true");

var param = "A";

(param >=0 && param <=4) ? console.info("in range") : console.info("Out of range");

var volume = "foo";
Number(volume) ? console.info("number") : console.info("NaN");