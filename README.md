to install:
==========

`npm install purify-css-inliner`

using the library:
==========

via command line:

```
purifycssinliner <filename>.html
```

can also be used as a package:
```
let purify = require('purify-css'),
  inliner = require('../src/purifycssinliner')(purify)
inliner(process.argv[2], (output) => {})
```

what it do:
==========

this gathers css from link tags on an HTML file, concatenates them together, and passes everything to
the purify-css library. then the output is inserted into the page as critical css