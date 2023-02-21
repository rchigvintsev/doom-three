export class Objects {
    /**
     * Three.js does not like when unknown properties are passed to its classes. This function copies target object
     * and removes all own properties from it.
     */
    static narrowToParent(target: any): any {
        const result = {...target};
        for (const key of Object.keys(result)) {
            if (result.hasOwnProperty(key)) {
                delete result[key];
            }
        }
        return result;
    }
}