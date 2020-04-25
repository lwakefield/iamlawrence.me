import React from 'react'
import Link from 'next/link'

import { parsePost } from '../../lib/post';

export default ({ posts }) => (
  <div>
      <h1>Blog</h1>
      {posts.map(post => (
          <div>
              <Link href={`/posts/${post.slug}`}>
                  {`${post.published} - ${post.title}`}
              </Link>
          </div>
      ))}
  </div>
);

export const getStaticProps = () => {
    const fs = require('fs');
    const path = require('path');
    const postsDirectory = path.join(process.cwd(), 'pages/posts');
    const filenames = fs.readdirSync(postsDirectory);

    const posts = [];
    for (const filename of filenames) {
        if (!filename.endsWith('.md')) continue;

        const filePath = path.join(postsDirectory, filename)
        const fileContents = fs.readFileSync(filePath, 'utf8')

        const { meta } = parsePost(fileContents);

        const slug = path.basename(filename, '.md');

        posts.push({ ...meta, slug });
    }

    posts.sort((a, b) => {
        return b.published > a.published ? 1 : -1;
    });

    return  {
        props: { posts },
    }
};
