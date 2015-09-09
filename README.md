# Hot Buzz

## Overview

Consumes a bunch of feeds to get latest products from relevant sites (e.g. firebox) and scores/rates/ranks them.

## Running it

The app is configured in `config.cson` but the default values are fine.

### Start Database

Eg:

    mongod --dbpath ~/Database


### Pull down new products and rate them

The process that monitors sites/feeds and scrapes the items runs continuously in the background

    ./backgroundworker.js

backgroundworker has two parts
 - workers/feedconsumer.js (pulls down new products via kimono)
 - workers/productranker.js (counts primary and secondary links to rate products)

that run on a schedule (see `config.cson`). feedconsumer needs to be run first to produce the output for the productranker. You can also run each independently:

    ./workers/feedconsumer.js
    ./workers/productranker.js

Since productranker runs less often, you might want to run it immediately.

### Run the web UI to see ranked products

The web front-end app displays the results, run it with:

    cd app;
    gulp

and then browse to `localhost:3030`

## Appendix

Consuming web page data for products/links (as opposed to RSS feeds) is achieved using [kimono](https://www.kimonolabs.com/).

[Credentials for kimono](https://docs.google.com/a/thesandpit.com/document/d/1-tXbvjzWGGgdsWRSdEo9lDbWGSFB5l9PihjEcugKQNk/edit?disco=AAAAAKehcpg)

Multiple different scrapers for different feeds/websites have been implemented, but the ones below are not currently being used. Details of them kept here just for reference:

 - engadget: http://www.engadget.com/rss.xml
 - stufftv: http://www.stuff.tv/rss
 - techcrunch: http://techcrunch.com/gadgets/feed/
