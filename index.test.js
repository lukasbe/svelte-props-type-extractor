import { describe, it, vi, expect } from 'vitest';
import { extractTypesFromFile } from '.';


describe('script tag extraction', () => {
    vi.mock('node:fs/promises', async () => {
        return {
            ...(vi.importActual < typeof import("node:fs/promises") > ("node:fs/promises")),
            readFile: vi.fn()
                .mockReturnValueOnce(Promise.resolve(Buffer.from(`
        <script lang="ts">

            export let label: string;
            export let size: 'SMALL' | 'MEDIUM' | 'LARGE' = 'MEDIUM';
            export let clickFunction = () => {
                alert('button clicked');
            };

            //some comment

            /* some other
            * multiline comment
            */
            export let fontsize: 'SMALL' | 'MEDIUM' | 'LARGE' = 'MEDIUM';
            export let icontype: string | undefined = undefined;
            export let disabled: boolean;

        </script>
    
    
        <button
        class:small={size == 'SMALL'}
        class:large={size == 'LARGE'}
        on:click={clickFunction}
        >{label}</button>
    
        <style>
            button{
                background-color: orange;
                padding: .5rem;
                border: .1rem solid black;
                border-radius: 3rem;
                font-size: 1rem;
            }
        
            button.small{
                font-size: .8rem;
            }
        
            button.large{
                font-size: 2rem;
            }
        
        </style>`)))
                .mockReturnValueOnce(Promise.resolve(Buffer.from(`
        <script lang="ts">

            export let label: string;
            export let size: 'SMALL' | 'MEDIUM' | 'LARGE' = 'MEDIUM';
            export let clickFunction = () => {
                alert('button clicked');
            };

        </script>
    
    
        <button
        class:small={size == 'SMALL'}
        class:large={size == 'LARGE'}
        on:click={clickFunction}
        >{label}</button>
    
        <style>
            button{
                background-color: orange;
                padding: .5rem;
                border: .1rem solid black;
                border-radius: 3rem;
                font-size: 1rem;
            }
        
            button.small{
                font-size: .8rem;
            }
        
            button.large{
                font-size: 2rem;
            }
        
        </style>`)))
                .mockReturnValueOnce(Promise.resolve(Buffer.from(`
        <script lang="ts">

            export let label: string;
            export let size: 'SMALL' | 'MEDIUM' | 'LARGE' = 'MEDIUM';
            export let clickFunction = () => {
                alert('button clicked');
            };

        </script>
    
    
        <button
        class:small={size == 'SMALL'}
        class:large={size == 'LARGE'}
        on:click={clickFunction}
        >{label}</button>
    
        <style>
            button{
                background-color: orange;
                padding: .5rem;
                border: .1rem solid black;
                border-radius: 3rem;
                font-size: 1rem;
            }
        
            button.small{
                font-size: .8rem;
            }
        
            button.large{
                font-size: 2rem;
            }
        
        </style>`)))
                .mockReturnValueOnce(Promise.resolve(Buffer.from(`
        <script lang="ts">

            export let label: string;
            export let size: 'SMALL' | 'MEDIUM' | 'LARGE' = 'MEDIUM';
            export let clickFunction = () => {
                alert('button clicked');
            };
        </script>
    
    
        <button
        class:small={size == 'SMALL'}
        class:large={size == 'LARGE'}
        on:click={clickFunction}
        >{label}</button>
    
        <style>
            button{
                background-color: orange;
                padding: .5rem;
                border: .1rem solid black;
                border-radius: 3rem;
                font-size: 1rem;
            }
        
            button.small{
                font-size: .8rem;
            }
        
            button.large{
                font-size: 2rem;
            }
        
        </style>`)))
                .mockReturnValueOnce(Promise.resolve(Buffer.from(`
            <script lang="ts">

                export let label: string;
                export let size: 'SMALL' | 'MEDIUM' | 'LARGE' = 'MEDIUM';
                export let clickFunction = () => {
                    alert('button clicked');
                };
                let test1 = 'a';
        
            </script>
        
        
            <button
            class:small={size == 'SMALL'}
            class:large={size == 'LARGE'}
            on:click={clickFunction}
            >{label}</button>
        
            <style>
                button{
                    background-color: orange;
                    padding: .5rem;
                    border: .1rem solid black;
                    border-radius: 3rem;
                    font-size: 1rem;
                }
            
                button.small{
                    font-size: .8rem;
                }
            
                button.large{
                    font-size: 2rem;
                }
            
            </style>`))),
        };
    });
    it('extract script lines from svelte file', async () => {
        expect(await extractTypesFromFile('test.svelte')).toStrictEqual([
            {
                name: 'label',
                type: 'STRING'
            },
            {
                name: 'size',
                type: 'UNION',
                values: ['SMALL', 'MEDIUM', 'LARGE'],
                assignedValue: 'MEDIUM'
            },
            {
                name: 'clickFunction',
                type: '() => void',
            },
            {
                name: 'fontsize',
                type: 'UNION',
                values: ['SMALL', 'MEDIUM', 'LARGE'],
                assignedValue: 'MEDIUM'
            },
            {
                name: 'icontype',
                type: 'STRING',
            },
            {
                name: 'disabled',
                type: 'UNION',
                values: ['false', 'true']
            },
        ])
    });
    it('extract script lines from svelte file - exclude functions', async () => {
        expect(await extractTypesFromFile('test.svelte', { exclude: ["FUNCTIONS"] })).toStrictEqual([
            {
                name: 'label',
                type: 'STRING'
            },
            {
                name: 'size',
                type: 'UNION',
                values: ['SMALL', 'MEDIUM', 'LARGE'],
                assignedValue: 'MEDIUM'
            }
        ])
    });
    it('extract script lines from svelte file - exclude unions', async () => {
        expect(await extractTypesFromFile('test.svelte', { exclude: ["UNIONS"] })).toStrictEqual([
            {
                name: 'label',
                type: 'STRING'
            },
            {
                name: 'clickFunction',
                type: '() => void',
            }
        ])
    });
    it('extract script lines from svelte file - exclude variables', async () => {
        expect(await extractTypesFromFile('test.svelte', { exclude: ["VARIABLES"] })).toStrictEqual([
            {
                name: 'clickFunction',
                type: '() => void',
            }
        ])
    });
    it('extract script lines from svelte file - extra variables without exports', async () => {
        expect(await extractTypesFromFile('test.svelte')).toStrictEqual([
            {
                name: 'label',
                type: 'STRING'
            },
            {
                name: 'size',
                type: 'UNION',
                values: ['SMALL', 'MEDIUM', 'LARGE'],
                assignedValue: 'MEDIUM'
            },
            {
                name: 'clickFunction',
                type: '() => void',
            }
        ]);
    });
})