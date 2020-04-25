import { parsePost } from '../../lib/post';

export default ({ post }) => {
  return (
    <div>
      <h1 children={post.meta.title} />
      <p><em>{post.meta.published}</em></p>
      <br />
      <div dangerouslySetInnerHTML={{__html: post.rendered}} />
    </div>
  );
};

export async function getStaticPaths() {
  const fs = require('fs');
  const path = require('path');
  const postsDirectory = path.join(process.cwd(), 'pages/posts');
  const filenames = fs.readdirSync(postsDirectory);
  const paths = [];
  for (const filename of filenames) {
    if (!filename.endsWith('.md')) continue;
    paths.push({ params: { slug: path.basename(filename, '.md') } });
  }
  return { paths, fallback: false };
}


export const getStaticProps = (context) => {
  const fs = require('fs');
  const path = require('path');
  const postsDirectory = path.join(process.cwd(), 'pages/posts');

  const filePath = path.join(postsDirectory, context.params.slug + '.md');
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const post = parsePost(fileContents);

  return  {
    props: { post },
  }
};
