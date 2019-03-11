

let str = '{"errcode":0,"errmsg":"ok","access_token":"9PMNJRDkAKQb7nFxRDdQF0BKx7n88TqVZj9c-QDFV6FfmJvydQlcue1njtWDCcb0DFNnTsX3_vSK9lrd0ryKi2sWmd1fQVt04npets6qnRSdru88S_r_r1oPqcc_NGcdhqRj8GGgYqs1C7Ug50mkuF2iIM7g5BmysxVDwkSjCUYHB6Edp3PJWMpA7KU5E1Rby7FlWAtARbOTy4r7d0CmIw","expires_in":7200}'

let j = JSON.parse(str);

console.log(j)
console.log(str)


let j2 = {};

console.log(JSON.stringify(j2))
