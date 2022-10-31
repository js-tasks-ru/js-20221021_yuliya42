/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
    const pickObj = {};
    Object.entries(obj).map(([key, value]) => {
        if (fields.find(item => item === key)) { pickObj[key] = value; }
    });
    return pickObj;
};
