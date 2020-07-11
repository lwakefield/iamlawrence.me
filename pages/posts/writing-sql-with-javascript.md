title: Writing SQL with JavaScript
published: 2020/07/11

---

The more database queries I have written I write in application-land, the more I prefer writing _raw_ SQL. I like the simplicity the explicitness. Both query-builders and ORMs abstract that away, and remove the control you have over the query. It also requires learning a new DSL (read API) which eventually maps to SQL, so you end up needing to know two times as many APIs as well as learning how they interact with one another.

My biggest gripe with writing raw SQL, is that it the binding syntax is cumbersome and it opens the door for possible injection vulnerabilities.

```
pg.query(`select * from users where username=${username}`);
//                                           ^ ahhh-no!
```

Since ES2015, JavaScript introduced ["Template String Literals"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), which are probably best known for their pretty interpolation syntax: ``console.log(`hello my name is ${name}`)``.

What is less frequently used is ["Tagged Template String Literals"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates) - where allow you to define a function to provide custom interpolation logic.

```
function math (strings, ...vals) {
  const words = vals.map(v => {
    if (v === 1) return 'one';
    if (v === 2) return 'two';
    if (v === 3) return 'three';
  });
  return strings[0]
    + words[0]
    + strings[1]
    + words[1]
    + strings[2]
    + words[2];
}

console.log(math`sum: ${1} + ${2} = ${3}`);
// 'sum: one + two = three'
```

Kinda a weird example - but demonstrates the point.

Anyway, here is the "one weird trick" that will allow you to write raw SQL fearlessly:

```
const client = knex(); // we use knex, but this can be adapted to any driver

function query (sql, ...bindings) {
  return client.raw(sql.join('?'), bindings);
}

const username = 'alice';
await query`select * from users where username=${username}`;
```

We can get craftier, and get it to play nice with transactions too:

```
function transaction () {
  const { raw, commit, rollback } = client.transaction();
  function query (sql, ...bindings) {
    return trx.raw(sql.join('?'), bindings);
  }
  return { query, commit, rollback };
}

const trx = transaction();
try {
  await trx.query(`insert into messages values (${msg})`);
  await trx.query(`insert into messages values (${msg})`);
  await trx.commit();
} catch (e) {
  await trx.rollback();
}
```

No doubt, this isn't the only cheeky usage of tagged template literals. Go forth, write SQL freely unencumbered by fear of injection vulnerabilities.
