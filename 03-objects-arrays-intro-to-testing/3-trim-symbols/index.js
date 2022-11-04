/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    
    function countChar (char, pos) {        
        if (resultStr[pos] !== char || pos < 0) return 0;
        let count = 1 + countChar(char, pos-1);
        return count;        
    }

    let resultStr = '';
    for ( let i = 0; i < string.length; i++ ) {
        if ( countChar(string[i], resultStr.length-1) === size) continue;
        resultStr += string[i];
    }

    return resultStr;
}
