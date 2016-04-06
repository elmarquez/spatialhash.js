Spatial Hash
============

Fast spatial indexing and search for three.js.

Internally, the library stores data in a non-THREE format to make it easier to
execute functions on workers. As a result, you will need to transform
positional information back into THREE objects when pulling data from the index.


Dependencies
------------

Install all development dependencies:

    npm install


Building a Distribution
-----------------------

Show build commands:

    grunt

Build the library:

    grunt compile

Test the distribution:

    grunt test


Discussion
----------

Research papers on spatial hashes, comparison to other data structures:

* Optimization of Large-Scale, Real-Time Simulations by Spatial Hashing
  http://www.cs.ucf.edu/~jmesit/publications/scsc%202005.pdf
* Quadtree vs. Spatial Hashing - a Visualization http://zufallsgenerator.github.io/2014/01/26/visually-comparing-algorithms/
* http://www.gamedev.net/page/resources/_/technical/game-programming/spatial-hashing-r2697
* http://matthias-mueller-fischer.ch/publications/tetraederCollision.pdf

Spatial hash implementations:

* http://zufallsgenerator.github.io/assets/code/2014-01-26/spatialhash/spatialhash.js
* http://entitycrisis.blogspot.com.au/2011/07/spatial-hash-in-javascript-for-2d.html
* https://www.npmjs.com/package/spatial-grid
* https://conkerjo.wordpress.com/2009/06/13/spatial-hashing-implementation-for-fast-2d-collisions/


To Do
-----

* Reimplement in TypeScript.


License
-------

See the LICENSE file.
