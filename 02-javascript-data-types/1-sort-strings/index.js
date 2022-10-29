/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    let k = 1;
    if (param === 'desc') { k = -1; }
    const sortedArr = arr.slice();
    sortedArr.sort( (str1, str2) => str1.localeCompare(str2, ["ru", "en"], { caseFirst: "upper" }) * k );
    return sortedArr;
}