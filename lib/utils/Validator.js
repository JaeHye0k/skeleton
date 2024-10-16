import ERROR_MESSAGE from "../constants/ERROR_MESSAGE.js";
import JOIN from "../constants/JOIN.js";

class TypeChecker {
    /**
     * 배열의 원소가 어떤 타입인지 반환하는 함수
     * @param {any[]} arr
     * @returns {string[]}
     */
    static arrayTypeof(arr) {
        const types = new Set();
        arr.forEach((e) => {
            types.add(typeof e);
        });
        return [...types];
    }

    /**
     * 인수로 전달한 배열이 특정 타입인지 확인하는 변수
     * @param {any[]} arr
     * @param {string} type
     * @returns {boolean}
     */
    static isArrayTypeof(arr, type) {
        const types = TypeChecker.arrayTypeof(arr);
        return types.every((t) => t === type);
    }

    static isObjectLiteral(obj) {
        return obj && Object.getPrototypeOf(obj) === Object.prototype;
    }
}

class Validator {
    static checkCols(cols) {
        // 1. cols가 배열인지 확인
        const isArray = Array.isArray(cols);
        if (!isArray) throw TypeError(ERROR_MESSAGE.COLS);
        // 2. 배열의 원소가 있다면 string 타입 인지 확인
        const isStringArray = cols.length === 0 || TypeChecker.isArrayTypeof(cols, "string");
        if (!isStringArray) throw TypeError(ERROR_MESSAGE.COLS);
    }

    static checkInto(into) {
        const isString = typeof into === "string";
        if (!isString) throw TypeError(ERROR_MESSAGE.INTO);
    }

    static checkDistinct(distinct) {
        const isBoolean = typeof distinct === "boolean";
        if (!isBoolean) throw TypeError(ERROR_MESSAGE.DISTINCT);
    }

    static checkJoins(joins) {
        const isArray = Array.isArray(joins);
        if (!isArray) {
            throw TypeError(ERROR_MESSAGE.JOIN.ARRAY);
        }
        joins.forEach((join) => {
            Validator.checkJoin(join);
        });
    }

    static checkJoin(join) {
        const hasValidProperty =
            Object.prototype.hasOwnProperty.call(join, "type") &&
            Object.prototype.hasOwnProperty.call(join, "from") &&
            Object.prototype.hasOwnProperty.call(join, "on") &&
            Object.keys(join).length === 3;

        const isValidJoinType = Object.prototype.hasOwnProperty.call(JOIN, join.type);
        const isValidJoinFrom = typeof join.from === "string";

        if (!hasValidProperty) throw TypeError(ERROR_MESSAGE.JOIN.PROPERTY);
        if (!isValidJoinType) throw TypeError(ERROR_MESSAGE.JOIN.TYPE);
        if (!isValidJoinFrom) throw TypeError(ERROR_MESSAGE.JOIN.FROM);
    }

    /**
     *
     * @param {(number | string | boolean | Date)[][]} values
     */
    static checkValues(values) {
        // 2차원 배열인지 확인
        const isArrayValues = Array.isArray(values);
        if (!isArrayValues) throw TypeError(ERROR_MESSAGE.VALUES.TWO_DIMENSION_ARRAY);
        const isArrayValue = values.every((value) => Array.isArray(value));
        if (!isArrayValue) throw TypeError(ERROR_MESSAGE.VALUES.ARRAY);
        // 원소의 타입 체크
        const validTypes = ["number", "string", "boolean"];
        const isValidTypes = values.every((value) => {
            return value.every((data) => {
                const isDate = data instanceof Date;
                const isValidType = validTypes.includes(typeof data) || isDate;
                return isValidType;
            });
        });
        if (!isValidTypes) throw TypeError(ERROR_MESSAGE.VALUES.TYPE);
    }

    static checkFrom(from) {
        const isArray = Array.isArray(from);
        if (!isArray) throw TypeError(ERROR_MESSAGE.FROM);
        const isString = from.every((table) => typeof table === "string");
        if (!isString) throw TypeError(ERROR_MESSAGE.FROM);
    }

    static checkOrderBy(orderBy) {
        // 1. orderBy 가 유효한 속성을 갖고 있는지 확인
        const hasValidProperty =
            Object.prototype.hasOwnProperty.call(orderBy, "cols") &&
            Object.prototype.hasOwnProperty.call(orderBy, "order") &&
            Object.keys(orderBy).length === 2;
        if (!hasValidProperty) throw TypeError(ERROR_MESSAGE.ORDER_BY.PROPERTY);
        // 2. orderBy.cols 가 배열인지 확인
        const colsIsArray = Array.isArray(orderBy.cols);
        if (!colsIsArray) throw TypeError(ERROR_MESSAGE.ORDER_BY.COLS);
        // 3. orderBy.cols 의 원소가 전부 string 이거나 전부 number 타입인지 확인
        const isStringCols = orderBy.cols.every((col) => typeof col === "string");
        const isNumberCols = orderBy.cols.every(
            (col) => typeof col === "number" && !Number.isNaN(col),
        );
        if (!isStringCols && !isNumberCols) throw TypeError(ERROR_MESSAGE.ORDER_BY.COLS);
        // 4. orderBy.order 가 배열인지 확인
        const orderIsArray = Array.isArray(orderBy.order);
        if (!orderIsArray) throw TypeError(ERROR_MESSAGE.ORDER_BY.ORDER);
        // 5. orderBy.order 배열의 원소가 "ASC" 또는 "DESC" 인지 확인
        const isASCOrDESC = orderBy.order.every((o) => o === "ASC" || o === "DESC");
        if (!isASCOrDESC) throw TypeError(ERROR_MESSAGE.ORDER_BY.ORDER);
    }

    static checkGroupBy(groupBy) {
        // 1. groupBy가 유효한 속성을 갖고 있는지 확인
        const hasValidProperty =
            Object.prototype.hasOwnProperty.call(groupBy, "cols") &&
            Object.keys(groupBy).length === 1;

        if (!hasValidProperty) throw TypeError(ERROR_MESSAGE.GROUP_BY.PROPERTY);

        // 2. groupBy.cols 가 배열인지 확인
        const colsIsArray = Array.isArray(groupBy.cols);
        if (!colsIsArray) throw TypeError(ERROR_MESSAGE.GROUP_BY.COLS);

        // 3. groupBy.cols 배열의 원소가 전부 string 타입인지 확인
        const isStringCols = groupBy.cols.every((col) => typeof col === "string");
        if (!isStringCols) throw TypeError(ERROR_MESSAGE.GROUP_BY.COLS);
    }

    static checkWhere(where) {
        // 1. where 이 string 타입인지 확인
        const isStringWhere = typeof where === "string";
        if (!isStringWhere) throw TypeError(ERROR_MESSAGE.WHERE);
    }

    static checkLimit(limit) {
        // limit 객체가 base 속성을 갖는지 확인
        const hasValidBaseProperty = Object.prototype.hasOwnProperty.call(limit, "base");

        if (!hasValidBaseProperty) {
            throw TypeError(ERROR_MESSAGE.LIMIT.PROPERTY);
        }

        // limit.base 가 number 타입인지 확인
        const isNumberBase = typeof limit.base === "number" && !Number.isNaN(limit.base);
        if (!isNumberBase) {
            throw TypeError(ERROR_MESSAGE.LIMIT.BASE);
        }

        // limit.offset 이 있을 경우에만 number 타입인지 확인
        if (limit.offset !== undefined) {
            const isNumberOffset = typeof limit.offset === "number" && !Number.isNaN(limit.offset);
            if (!isNumberOffset) {
                throw TypeError(ERROR_MESSAGE.LIMIT.OFFSET);
            }
        }
    }

    static checkSet(set) {
        // 1. 객체 리터럴 타입인지 확인
        const isObjectLiteral = TypeChecker.isObjectLiteral(set);
        if (!isObjectLiteral) throw TypeError(ERROR_MESSAGE.SET.OBJECT);
        // 2. 프로퍼티가 존재하는지 확인
        const hasProperty = Object.keys(set).length > 0;
        if (!hasProperty) throw TypeError(ERROR_MESSAGE.SET.PROPERTY);
    }

    static checkHaving(having) {
        // 1. having 이 string 타입인지 확인
        const isStringHaving = typeof having === "string";
        if (!isStringHaving) throw TypeError(ERROR_MESSAGE.HAVING);
    }
}

export default Validator;
