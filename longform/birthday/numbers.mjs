const allDiff = (n, d = 365) => { let q = 1; for (let i = 0; i < n; i++) q *= (d - i) / d; return q; };
const P = (n, d = 365) => 1 - allDiff(n, d);
const q = (n) => 1 - Math.pow(364 / 365, n);
for (const n of [1,5,10,15,20,22,23,25,30,40,41,47,50,57,60,70,75,100]) console.log(n, (100*P(n)).toFixed(4));
const first = (f, th) => { let n = 1; while (f(n) < th) n++; return n; };
console.log('P>=0.5 at', first(P, 0.5), 'P>=0.9', first(P,0.9), 'P>=0.99', first(P,0.99), 'P>=0.999', first(P,0.999));
console.log('q(22)', q(22), 'q(23)', q(23), 'first q>=0.5', first(q, 0.5), q(252), q(253));
console.log('365 ln2', 365*Math.log(2), 'sqrt(2*365 ln2)', Math.sqrt(2*365*Math.log(2)), '1.1774*sqrt365', Math.sqrt(2*Math.log(2)), Math.sqrt(365), 0.5+Math.sqrt(0.25+2*Math.log(2)*365));
console.log('(364/365)^253', Math.pow(364/365,253), '253/365', 253/365);
for (const d of [182, 183, 366, 1000, 1e6]) { let n = 1; while (P(n, d) < 0.5) n++; console.log('d', d, 'n50', n, 'approx', 0.5+Math.sqrt(0.25+2*Math.log(2)*d), 1.1774*Math.sqrt(d)); }
// mean first match
let Q = 0, t = 1; for (let k = 1; k <= 365; k++) { t = 1; for (let i = 0; i < k; i++) t *= (365 - i) / 365; Q += t; } console.log('mean first match 1+Q', 1 + Q);
// probability first match at exactly n
let best = 0, bn = 0; for (let n = 2; n < 100; n++) { const pm = P(n) - P(n-1); if (pm > best) { best = pm; bn = n; } } console.log('mode of first match', bn, best);
console.log('2^32', 2**32, '1.1774*2^32', 1.1774*2**32, 'sqrt(pi/2 * 2^64)', Math.sqrt(Math.PI/2*2**64), '2^64', 2**64, '2^63', 2**63, '2^128', 2**128, 1.1774*2**128);
console.log('worldcup expected', 32*P(23));
// half the year
