export function extractTypesFromFile(path: string, options?: {
    exclude?: Array<'VARIABLES' | 'FUNCTIONS' | 'UNIONS'>;
}): Promise<prop[]>;
export type prop = {
    name: string;
    type: string;
    /**
     * - optional
     */
    values: Array<string | number>;
};
