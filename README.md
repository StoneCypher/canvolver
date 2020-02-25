canvolver
=========

## tl,dr:

[Go here and click "constant generation"](http://stonecypher.github.io/canvolver/canvolver.html)

## what?

Man I was bored, a long time ago, so I created a low quality canvas polygon evolver.  It does fairly dumb and neat crap like this:

![](/screens/MorganFreeman.png)

If you leave it on absurdly long, it does this instead:

![](/screens/NeilTysonEx.png)

What?  ... How?
---------------

The power of dice!

Start with an image.  Create a canvas of the same size.  Create a function f(Pix1,Pix2) that returns a number [0..1] on how similar two pixels' colors are.  Take the average of that function over every matched pixel in the two images.  Pow: a measure of "image similarity."

Now, create a pool of random "image genomes," which are just lists of polygons to draw deepest-first in flat color.  Randomly add or modify features and colors, keeping the "most similar" and murdering the remainder.

It's easier when you see it.  Start with a Lisa Edelstein.

![](/screens/CuddyOrig.png)

After around 50,000 generations:

![](/screens/CuddyLo.png)

At 200,000:

![](/screens/CuddyMed.png)

At 500,000:

![](/screens/CuddyHi.png)

And a million (Dr. Evil finger):

![](/screens/CuddyEx.png)

Because this is javascript, it's extremely fast.  (checks notes)  Wait, no.

Also I have applied approximately zero careful effort to this.  So you can expect a display quality piece to take 30-40 minutes on a quad-2.4.  Chrome's canvas implementation is dramatically faster than the competition at time of writing, and will do the work as such much much faster.





Hey.  `:|`  I looked at the source. `>:(`
-----------------------------------------

I mean, let's be direct.  This is not good code.  I was pretty drunk the night I wrote this.  I just don't care enough to fix it.





Polemic :neckbeard:
-------------------

`canvolver` is MIT licensed, because viral licenses and newspeak language modification are evil.  Free is ***only*** free when it's free for everyone.

... but you should not want this code.  Not even in jest.
