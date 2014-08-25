Revelry
=======

Revelry is a project builder for
[Reveal.js](http://lab.hakim.se/reveal-js/).

If you make a lot of presentations with Reveal, you will find yourself
unnecessarily duplicating huge chunks of boilerplate. With Revelry
you can concentrate on your presentation content and let Revelry take
care of the rest.

**NOTE**: This is a pre-alpha release. It doesn't do everything below
  just yet, but it will do soon!

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
	    custom.css
		header.html

**Revfile.json** is where all the configuration for your presentation
  goes. In here you can specify the title and description as well as
  Reveal options such as theme and plugins.

**slides.html** is a [Handlebars](http://handlebarsjs.com/)-enabled
  HTML file containing your slides. Each slide is given an HTML
  &lt;section&gt;.

**img** is a folder where you can put images you need for your
  presentation. Its contents will be copied to the web page when your
  project is built.

**custom** contains files that can be used to override some of the
  default HTML and CSS provided by Reveal.

Building
--------

Once you have filled out the contents of Revfile.json and slides.html,
you can build your project.

    $ cd myproject/
    $ revelry build

By default this will create the project in a .gitignored subdirectory
'www' of the project directory, but you can specify any target
directory:

    $ revelry build /var/www/myproject

