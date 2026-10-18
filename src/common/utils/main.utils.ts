export const isArray = (a: any): a is any[] => Array.isArray(a);

export const isNotEmptyArray = <T = any>(a: T[] | null | undefined | any): a is NonNullable<T[]> => isArray(a) && a.length > 0;

export const isString = (a: any): a is string => typeof a === "string";

export const isNotEmptyString = (a: string | null | undefined | any): a is string => isString(a) && a.trim().length > 0;

export const isObject = (a: any): a is Record<string, any> => a !== null && typeof a === "object" && !isArray(a);

export const isNotEmptyObject = <T extends object = Record<string, any>>(a: any): a is NonNullable<T> => isObject(a) && Object.keys(a).length > 0;

export const isFunction = (a: any): a is (...args: any[]) => any => typeof a === "function";

export const isNotEmptyFunction = (a: any): a is (...args: any[]) => any => isFunction(a) && a.length > 0;

export const isBoolean = (a: any): a is boolean => typeof a === "boolean";

export const isNotEmptyBoolean = (a: any): a is true => isBoolean(a) && a === true;

export const isNumber = (a: any): a is number => typeof a === "number" && !isNaN(a);

export const isNotEmptyNumber = (a: any): a is number => isNumber(a) &&  a !== 0;

export const isNull = (a: any): a is null => a === null;

export const isUndefined = (a: any): a is undefined => a === undefined;

export const isNotEmpty = (a:any)=> {
    if(isString(a)) return isNotEmptyString(a);
    if(isArray(a)) return isNotEmptyArray(a);
    if(isObject(a)) return isNotEmptyObject(a);
    if(isFunction(a)) return isNotEmptyFunction(a);
    if(isBoolean(a)) return isNotEmptyBoolean(a);
    if(isNumber(a)) return isNotEmptyNumber(a);
    return false;
}

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};


export const responseError = (err: any): string => {
    if (isString(err)) return err;
    if (err?.response?.data?.message) return String(err.response.data.message);
    if (err?.data?.message) return String(err.data.message);
    if (err?.message) return String(err.message);
    return "Something went wrong";
}; 