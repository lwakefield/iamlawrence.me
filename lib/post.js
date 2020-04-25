import marked from 'marked';

export const parsePost = (content) => {
    const [ metaLines,  ...rest ] = content.split('\n---\n');
    const meta  = metaLines.split('\n')
        .map(v => v.trim())
        .filter(Boolean)
        .map(line => {
            const [key, ...rest] =  line.split(':')
            const val = rest.join(':').trim();
            return {  key, val };
        }).reduce((acc, curr) => ({
            ...acc,
            [curr.key]:  curr.val,
        }), {});
    const rendered = marked(rest.join('\n'));

    return {
        meta,
        rendered
    };
};
