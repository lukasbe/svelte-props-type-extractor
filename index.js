//@ts-check
import { readFile } from 'fs/promises';
import { VariableDeclarationKind } from 'ts-morph';
import { Project } from "ts-morph";
import ts from 'typescript'
const project = new Project();

/**
 * reads the file and gets its content
 * @param {string} path 
 * @returns {Promise<string>}
 */
const readFileToStr = async (path) => {
    const readBuffer = await readFile(path);
    const fileContent = readBuffer.toString();
    return fileContent;
};

/**
 * extracts code lines in script tag
 * @param {string} content 
 * @returns {Array<String>}
 */
const extractScriptTag = (content) => {
    const lines = content.split(/\n/g);
    let startLine = -1;
    let endLine = -1;
    startLine = lines.findIndex(line => line.includes('<script lang="ts">'));
    endLine = lines.findIndex(line => line.includes('</script>'));
    if (startLine == -1 || endLine == -1) {
        throw new Error(`Could not extract script tag!`);
    }
    const scriptLines = lines.filter((line, idx) => idx > startLine && idx < endLine && line !== '');
    return scriptLines;
}

/**
 * @typedef prop
 * @prop {string} name
 * @prop {string} type
 * @prop {Array<String|Number>} [values]
 * @prop {string | number | boolean} [assignedValue]
 */

/**
 * extracts all variables and types
 * @param {string[]} lines
 * @param {{exclude?: Array<'VARIABLES' | 'FUNCTIONS' | 'UNIONS'>}} options
 * @return {prop[]}
 */
const getVariableTypes = (lines, options) => {
    /**
     * @type {prop[]}
     */
    const variables = [];
    const svelteSource = project.createSourceFile('tmp.ts', lines.join('\n'), { overwrite: true });

    svelteSource.getVariableStatements().filter(v => v.hasExportKeyword() && v.getDeclarationKind() == VariableDeclarationKind.Let).forEach(v => {
        const declarations = v.getDeclarations();
        declarations.forEach(declaration => {
            if (options.exclude?.includes("VARIABLES") && !declaration.getType().isAnonymous()) return;
            if (options.exclude?.includes("UNIONS") && declaration.getType().isUnion()) return;
            if (options.exclude?.includes("FUNCTIONS") && declaration.getType().isAnonymous()) return;

            const name = declaration.getName();
            let type = declaration.getType().getText();
            if (!declaration.getType().isAnonymous()) {
                type = type.toUpperCase();
            }
            /**
            * @type {prop}
            */
            let variable = {
                name,
                type,
            };
            if (declaration.getType().isUnion()) {
                const values = declaration.getType().getUnionTypes().map(u => u.getText().replace(/"/g, ''));
                variable = { ...variable, type: 'UNION', values };
            }
            const stringLiterals = declaration.getChildrenOfKind(ts.SyntaxKind.StringLiteral);
            const numericLiterals = declaration.getChildrenOfKind(ts.SyntaxKind.NumericLiteral);
            if(stringLiterals.length) variable.assignedValue = stringLiterals[0].getLiteralValue();
            else if(numericLiterals.length) variable.assignedValue = numericLiterals[0].getLiteralValue();
            else if(declaration.getChildrenOfKind(ts.SyntaxKind.TrueKeyword).length) variable.assignedValue = true;
            else if(declaration.getChildrenOfKind(ts.SyntaxKind.FalseKeyword).length) variable.assignedValue = false;

            variables.push(variable);
        });
    });
    return variables;
}


/**
 * extracts the prop types from a .svelte File
 * @param {string} path
 * @param {{exclude?: Array<'VARIABLES' | 'FUNCTIONS' | 'UNIONS'>}} options
 * @return {Promise<prop[]>}
 */
export const extractTypesFromFile = async (path, options = {}) => {
    const fileContent = await readFileToStr(path);
    const scriptTagLines = extractScriptTag(fileContent);
    const props = getVariableTypes(scriptTagLines, options);
    return props;
};

// /**
//  * scans a folder and extracts the prop types from svelte files
//  * @param {string} globPattern
//  * @param {{exclude?: Array<'VARIABLES' | 'FUNCTIONS' | 'UNIONS'>}} options
//  * @return {Promise<{path: string, props: prop[]}[]>}
//  */
// export const extractTypesFromFolder = async (globPattern, options = {}) => {
//     let paths = await glob.glob(globPattern);
//     const filesWithProps = [];
//     paths.forEach(async(path) => {
//         if(!path.trim().endsWith(".svelte")){
//             console.warn("Glob search found non-svelte file", path);
//             return;
//         }
//         const props = await extractTypesFromFile(path);
//         filesWithProps.push({
//             path,
//             props
//         });
//     });
//     return filesWithProps;
// };