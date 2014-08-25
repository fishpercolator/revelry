Revely
========

Revelry is a project builder for
[Reveal.js](http://lab.hakim.se/reveal-js/).

If you make a lot of presentations with Reveal, you will find yourself
unnecessarily duplicating huge chunks of boilerplate. With Revelry
you can concentrate on your presentation content and let Revelry take
care of the rest.

Installing
----------

    $ npm install -g revelry

Creating a project
------------------

    $ revelry new myproject

    $ revelry new myproject -t "My amazing presentation" -d "A short description of my presentation"

The anatomy of a Revelry project
---------------------------------

    myproject/
	  Revfile.json
	  slides.html
      img/
	  custom/
		header.html
	    custom.css

