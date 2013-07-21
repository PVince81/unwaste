Unwaste
=======

Unwaste is a webapp + server that make it possible for users who find garbage
to pick it up and mark it as picked up. People can also spot garbage they can't
or don't want to pick up and other people can find these spots to pick it up
themselves.

Set up dev environment
======================

- Install Node JS
- Install MySQL
- Set up MySQL (see SQL commands in doc/init_db.sql)
- Run the following commands:

    npm install

    npm install -g grunt-cli

Running the server
==================

To run in debug mode (default)
    
    grunt start

To run in production mode:

    grunt startprod

