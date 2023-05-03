#!/bin/sh

# bring the database up to date with migrations
npm run db:migrate

# seed any data that may be required.
npm run db:seed

# start
npm run start